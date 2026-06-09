import { APP_ORIGIN, appUrl } from '../config';

/**
 * Client-side auth stub — swap these functions for Supabase later.
 *
 * Supabase migration:
 *   signUp        → supabase.auth.signUp({ email, password, options: { data: { username, role } } })
 *   signIn        → supabase.auth.signInWithPassword({ email, password })
 *   signInGoogle  → supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: appUrl('/') } })
 *   signOut       → supabase.auth.signOut()
 *   getSession    → supabase.auth.getSession()
 */

const USERS_KEY = 'memome_users';
const SESSION_KEY = 'memome_session';

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

function normalizeUsername(raw) {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

function normalizeEmail(raw) {
  return raw.trim().toLowerCase();
}

async function hashPassword(password, saltB64) {
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
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

function toPublicUser(record) {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    role: record.role,
    tags: record.role === 'local' ? ['Local'] : ['Visitor'],
    collections: record.collections ?? { memos: 0, faves: 0 },
  };
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    const user = readUsers().find(u => u.id === userId);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
}

function writeSession(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function getSession() {
  return readSession();
}

export async function signUp({ username, email, password, role }) {
  const cleanUsername = normalizeUsername(username);
  const cleanEmail = normalizeEmail(email);
  const users = readUsers();

  if (!cleanUsername) {
    return { error: { field: 'username', message: 'Username is required' } };
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: { field: 'email', message: 'Enter a valid email address' } };
  }
  if (!role) {
    return { error: { field: 'role', message: 'Please select Visitor or Local to continue' } };
  }

  if (users.some(u => u.username === cleanUsername)) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }
  if (users.some(u => u.email === cleanEmail)) {
    return { error: { field: 'email', message: 'Email already taken' } };
  }

  const { hash, salt } = await createPasswordRecord(password);
  const record = {
    id: crypto.randomUUID(),
    username: `@${cleanUsername}`,
    email: cleanEmail,
    passwordHash: hash,
    salt,
    role,
    collections: { memos: 0, faves: 0 },
    createdAt: new Date().toISOString(),
  };

  users.push(record);
  writeUsers(users);
  writeSession(record.id);

  return { user: toPublicUser(record) };
}

export async function signIn({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const users = readUsers();
  const record = users.find(u => u.email === cleanEmail);

  if (!record) {
    return { error: { field: 'email', message: 'No account found with this email' } };
  }

  const valid = await verifyPassword(password, record.passwordHash, record.salt);
  if (!valid) {
    return { error: { field: 'password', message: 'Incorrect password' } };
  }

  writeSession(record.id);
  return { user: toPublicUser(record) };
}

export async function signInWithGoogle() {
  // TODO: supabase.auth.signInWithOAuth({
  //   provider: 'google',
  //   options: { redirectTo: appUrl('/') },
  // })
  void appUrl('/auth/callback');
  return {
    error: {
      field: 'form',
      message: `Google sign-in will be available once Supabase is connected. Use redirect URL: ${APP_ORIGIN}`,
    },
  };
}

export async function signOut() {
  clearSession();
}
