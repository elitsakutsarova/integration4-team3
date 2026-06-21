/** localStorage auth fallback when Supabase is not configured. */

import { LOGIN_EMAIL_ERROR, LOGIN_PASSWORD_ERROR } from './loginErrors';
import {
  NEW_PASSWORD_SAME_AS_OLD_MESSAGE,
  normalizeEmail,
  normalizeUsername,
  validateChangeEmailPayload,
  validateChangePasswordPayload,
  validateChangeUsernamePayload,
  validateSignInPayload,
  validateSignUpPayload,
} from './validators';

const USERS_KEY = 'memome_users';
const SESSION_KEY = 'memome_session';

function formatUsername(clean) {
  return `@${clean}`;
}

export function toPublicUser(record) {
  const username = record.username?.startsWith('@')
    ? record.username
    : formatUsername(record.username ?? '');

  const role = record.role ?? 'visitor';

  return {
    id: record.auth_id ?? String(record.id),
    username,
    email: record.email,
    role,
    tags: role === 'local' ? ['Local'] : ['Visitor'],
    collections: record.collections ?? { memos: 0, faves: 0 },
  };
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password, saltB64) {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function createPasswordRecord(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = btoa(String.fromCharCode(...saltBytes));
  const hash = await hashPassword(password, salt);
  return { hash, salt };
}

async function verifyPassword(password, hash, salt) {
  const attempt = await hashPassword(password, salt);
  return attempt === hash;
}

export function readLocalSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    const user = readUsers().find((u) => u.id === userId);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
}

export function writeLocalSession(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function localIsUsernameTaken(displayUsername) {
  const cleanUsername = normalizeUsername(displayUsername);
  return readUsers().some((u) => normalizeUsername(u.username) === cleanUsername);
}

export function localIsEmailRegistered(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email) return false;
  return readUsers().some((user) => normalizeEmail(user.email) === email);
}

export async function localSignUp({ username, email, password, role }) {
  const validated = validateSignUpPayload({ username, email, password, role });
  if (validated.field) return { error: validated };

  const { username: displayUsername, email: cleanEmail, password: cleanPassword, role: cleanRole } = validated;
  const cleanUsername = displayUsername.replace(/^@+/, '');
  const users = readUsers();
  if (users.some((u) => normalizeUsername(u.username) === cleanUsername)) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }
  if (users.some((u) => u.email === cleanEmail)) {
    return { error: { field: 'email', message: 'Email already taken' } };
  }

  const { hash, salt } = await createPasswordRecord(cleanPassword);
  const record = {
    id: crypto.randomUUID(),
    username: displayUsername,
    email: cleanEmail,
    passwordHash: hash,
    salt,
    role: cleanRole,
    collections: { memos: 0, faves: 0 },
    createdAt: new Date().toISOString(),
  };

  users.push(record);
  writeUsers(users);
  writeLocalSession(record.id);
  return { user: toPublicUser(record) };
}

export async function localSignIn({ email, password }) {
  const validated = validateSignInPayload({ email, password });
  if (validated.field) {
    return {
      error: {
        ...validated,
        email: String(email ?? '').trim(),
        password: String(password ?? ''),
      },
    };
  }

  const record = validated.identifierKind === 'email'
    ? readUsers().find((user) => user.email === validated.identifier)
    : readUsers().find(
      (user) => normalizeUsername(user.username) === normalizeUsername(validated.identifier),
    );

  if (!record) {
    return {
      error: {
        fieldErrors: {
          email: LOGIN_EMAIL_ERROR,
        },
        email: validated.email,
        password: validated.password,
      },
    };
  }

  const valid = await verifyPassword(validated.password, record.passwordHash, record.salt);
  if (!valid) {
    return {
      error: {
        field: 'password',
        message: LOGIN_PASSWORD_ERROR,
        email: validated.email,
        password: validated.password,
      },
    };
  }

  writeLocalSession(record.id);
  return { user: toPublicUser(record) };
}

export async function localResetPasswordByEmail({ email, newPassword }) {
  const users = readUsers();
  const record = users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
  if (!record?.passwordHash) {
    return { error: { field: 'form', message: 'Could not reset password for this account.' } };
  }

  if (await verifyPassword(newPassword, record.passwordHash, record.salt)) {
    return { error: { field: 'newPassword', message: NEW_PASSWORD_SAME_AS_OLD_MESSAGE } };
  }

  const { hash, salt } = await createPasswordRecord(newPassword);
  record.passwordHash = hash;
  record.salt = salt;
  writeUsers(users);
  return { success: true, kind: 'password' };
}

export async function localIsPasswordSameAsCurrent(email, password) {
  const users = readUsers();
  const record = users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
  if (!record?.passwordHash) return false;
  return verifyPassword(password, record.passwordHash, record.salt);
}

export async function localChangePassword({ userId, oldPassword, newPassword, confirmPassword }) {
  const validated = validateChangePasswordPayload({ oldPassword, newPassword, confirmPassword });
  if (validated.field) return { error: validated };

  const users = readUsers();
  const record = users.find((u) => u.id === userId);
  if (!record?.passwordHash) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const valid = await verifyPassword(validated.oldPassword, record.passwordHash, record.salt);
  if (!valid) return { error: { field: 'oldPassword', message: 'Incorrect password' } };

  const { hash, salt } = await createPasswordRecord(validated.newPassword);
  record.passwordHash = hash;
  record.salt = salt;
  writeUsers(users);
  return { success: true, kind: 'password' };
}

export async function localChangeEmail({ userId, oldEmail, newEmail, password }) {
  const validated = validateChangeEmailPayload({ oldEmail, newEmail, password });
  if (validated.field) return { error: validated };

  const users = readUsers();
  const record = users.find((u) => u.id === userId);
  if (!record?.passwordHash) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  if (normalizeEmail(record.email) !== validated.oldEmail) {
    return { error: { field: 'oldEmail', message: 'Old email does not match your account' } };
  }

  const taken = users.some(
    (u) => u.id !== userId && normalizeEmail(u.email) === validated.newEmail,
  );
  if (taken) return { error: { field: 'newEmail', message: 'Email already taken' } };

  const valid = await verifyPassword(validated.password, record.passwordHash, record.salt);
  if (!valid) return { error: { field: 'password', message: 'Incorrect password' } };

  record.email = validated.newEmail;
  writeUsers(users);

  const user = toPublicUser(record);
  if (readLocalSession()?.id === userId) writeLocalSession(userId);
  return { success: true, kind: 'email', user };
}

export async function localChangeUsername({ userId, username }) {
  const validated = validateChangeUsernamePayload({ username });
  if (validated.field) return { error: validated };

  const users = readUsers();
  const record = users.find((u) => u.id === userId);
  if (!record) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const nextClean = validated.value.replace(/^@+/, '').toLowerCase();
  const currentClean = normalizeUsername(record.username);
  if (currentClean === nextClean) {
    return { error: { field: 'username', message: 'Choose a different username' } };
  }

  const taken = users.some(
    (u) => u.id !== userId && normalizeUsername(u.username) === nextClean,
  );
  if (taken) return { error: { field: 'username', message: 'Username already taken' } };

  record.username = validated.value;
  writeUsers(users);

  const user = toPublicUser(record);
  if (readLocalSession()?.id === userId) writeLocalSession(userId);
  return { success: true, kind: 'username', user };
}

export async function localDeleteAccount(userId) {
  if (!userId) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const users = readUsers();
  const exists = users.some((user) => user.id === userId);
  if (!exists) {
    return { error: { field: 'form', message: 'Account not found.' } };
  }

  writeUsers(users.filter((user) => user.id !== userId));
  if (readLocalSession()?.id === userId) clearLocalSession();

  return { success: true, kind: 'delete-account', deleted: true };
}
