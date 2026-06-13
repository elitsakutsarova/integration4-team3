// auth engine - logic layer

import { isSupabaseEnabled, getSupabaseBrowserClient, USERS_TABLE } from './supabase.client';
import {
  validateChangeEmailPayload,
  validateChangePasswordPayload,
  validateChangeUsernamePayload,
  validateSignInPayload,
  validateSignUpPayload,
  normalizeUsername,
} from './validators';

function getClient() {
  return getSupabaseBrowserClient();
}

/**
 * Auth layer — uses Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set,
 * otherwise falls back to localStorage (current dev stub).
 */

const USERS_KEY = 'memome_users';
const SESSION_KEY = 'memome_session';

function normalizeEmail(raw) {
  return raw.trim().toLowerCase();
}

function formatUsername(clean) {
  return `@${clean}`;
}

function toPublicUser(record) {
  const username = record.username?.startsWith('@')
    ? record.username
    : formatUsername(record.username ?? '');

  const role = record.role ?? 'visitor';

  return {
    // auth_id links to Supabase Auth; int8 id is your table's own primary key
    id: record.auth_id ?? String(record.id),
    username,
    email: record.email,
    role,
    tags: role === 'local' ? ['Local'] : ['Visitor'],
    collections: record.collections ?? { memos: 0, faves: 0 },
  };
}

/* ─── localStorage fallback (no Supabase keys) ─────────── */

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

function readLocalSession() {
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

function writeLocalSession(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function localSignUp({ username, email, password, role }) {
  const validated = validateSignUpPayload({ username, email, password, role });
  if (validated.field) return { error: validated };

  const { username: displayUsername, email: cleanEmail, password: cleanPassword, role: cleanRole } = validated;
  const cleanUsername = displayUsername.replace(/^@+/, '');
  const users = readUsers();
  if (users.some(u => normalizeUsername(u.username) === cleanUsername)) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }
  if (users.some(u => u.email === cleanEmail)) {
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

async function localSignIn({ email, password }) {
  const validated = validateSignInPayload({ email, password });
  if (validated.field) return { error: validated };

  const record = readUsers().find(u => u.email === validated.email);

  if (!record) {
    return { error: { field: 'email', message: 'No account found with this email' } };
  }

  const valid = await verifyPassword(validated.password, record.passwordHash, record.salt);
  if (!valid) {
    return { error: { field: 'password', message: 'Incorrect password' } };
  }

  writeLocalSession(record.id);
  return { user: toPublicUser(record) };
}

/* ─── Supabase ─────────────────────────────────────────── */

function mapSupabaseAuthError(error, fallbackField = 'form') {
  const msg = error?.message ?? 'Something went wrong';
  const code = error?.code ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    return {
      field: 'form',
      message: 'Incorrect email or password.',
    };
  }
  if (/rate limit|over_email_send_rate_limit/i.test(msg)) {
    return {
      field: 'form',
      message: 'Too many attempts. Wait a few minutes, then try again.',
    };
  }
  if (/already registered|already exists|duplicate/i.test(msg)) {
    return { field: 'email', message: 'Email already taken' };
  }
  if (/username/i.test(msg)) {
    return { field: 'username', message: msg };
  }
  return { field: fallbackField, message: msg };
}

/** If signup already created the user, sign in instead of failing on email rate limit. */
async function trySignInAfterSignUpFailure(email, password) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) return null;
  if (!data.session?.user) return null;
  return ensureProfile(data.user);
}

/** Supabase returns success with empty identities when the email is already registered. */
function isExistingUserSignUpResponse(user) {
  return (user?.identities ?? []).length === 0;
}

/** null = unknown, auth_id = migrated schema, legacy = email-only rows */
let profileLinkMode = null;

function isMissingAuthIdColumn(error) {
  const msg = error?.message ?? '';
  return error?.code === '42703' || /auth_id.*does not exist|column users\.auth_id/i.test(msg);
}

function warnRunUsersMigration() {
  console.warn(
    '[MemMe] Run tests/test3/supabase/users.sql in Supabase → SQL Editor to add users.auth_id',
  );
}

async function fetchProfile(authUser) {
  const authUserId = typeof authUser === 'string' ? authUser : authUser.id;
  const email = typeof authUser === 'object' ? authUser.email : null;

  if (profileLinkMode !== 'legacy') {
    const { data, error } = await getClient()
      .from(USERS_TABLE)
      .select('id, auth_id, username, email, role, created_at')
      .eq('auth_id', authUserId)
      .maybeSingle();

    if (!error) {
      profileLinkMode = 'auth_id';
      return data ? toPublicUser(data) : null;
    }

    if (isMissingAuthIdColumn(error)) {
      profileLinkMode = 'legacy';
      warnRunUsersMigration();
    } else {
      throw error;
    }
  }

  if (!email) return null;

  const { data, error } = await getClient()
    .from(USERS_TABLE)
    .select('id, username, email, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicUser({ ...data, role: 'visitor' }) : null;
}

async function isUsernameTaken(username) {
  const { data, error } = await getClient()
    .from(USERS_TABLE)
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

/**
 * Insert profile row linked to Supabase Auth via auth_id.
 * Your table keeps its own int8 id; auth_id stores the auth.users uuid.
 */
async function syncAuthMetadata(authUser) {
  const username = authUser.user_metadata?.username;
  const role = authUser.user_metadata?.role;
  if (username && role) return authUser;

  const nextMeta = {
    username: username ?? '@user',
    role: role ?? 'visitor',
  };

  const { data, error } = await getClient().auth.updateUser({ data: nextMeta });
  if (error) {
    console.warn('Could not update auth user metadata:', error.message);
    return authUser;
  }
  return data.user ?? authUser;
}

async function insertProfile({ authId, username, email, role }) {
  if (profileLinkMode === 'legacy') {
    const { error } = await getClient().from(USERS_TABLE).upsert(
      { username, email },
      { onConflict: 'email', ignoreDuplicates: false },
    );
    if (error && !/duplicate|unique|already exists|no unique|constraint/i.test(error.message)) {
      // email may not be unique — fall back to plain insert
      const { error: insertError } = await getClient().from(USERS_TABLE).insert({ username, email });
      if (insertError && !/duplicate|unique|already exists/i.test(insertError.message)) throw insertError;
    }
    return;
  }

  const { error: rpcError } = await getClient().rpc('upsert_own_profile', {
    p_username: username,
    p_email: email,
    p_role: role,
  });

  if (!rpcError) return;

  if (/Could not find the function|42883|PGRST202/i.test(rpcError.message ?? '')) {
    console.warn('[MemMe] Run supabase/fix-users-rls.sql in Supabase SQL Editor, then retry.');
  }

  const { error } = await getClient().from(USERS_TABLE).upsert(
    { auth_id: authId, username, email, role },
    { onConflict: 'auth_id' },
  );

  if (error && isMissingAuthIdColumn(error)) {
    profileLinkMode = 'legacy';
    warnRunUsersMigration();
    return insertProfile({ authId, username, email, role });
  }

  if (error) throw rpcError.code === '42501' ? rpcError : error;
}

/** Create public.users row once the auth session exists (after email confirm or login). */
async function ensureProfile(authUser) {
  const synced = await syncAuthMetadata(authUser);
  const username = synced.user_metadata?.username ?? '@user';
  const email = synced.email ?? '';
  const role = synced.user_metadata?.role ?? 'visitor';

  const existing = await fetchProfile(synced);
  if (existing) return existing;

  try {
    await insertProfile({ authId: synced.id, username, email, role });
    const created = await fetchProfile(synced);
    if (created) return created;
    console.error('Profile insert succeeded but row not readable — check RLS policies on public.users');
  } catch (err) {
    if (isMissingAuthIdColumn(err)) warnRunUsersMigration();
    console.error('Could not save profile to public.users:', err.message ?? err);
  }

  return toPublicUser({ auth_id: synced.id, username, email, role });
}

async function supabaseSignUp({ username, email, password, role }) {
  const validated = validateSignUpPayload({ username, email, password, role });
  if (validated.field) return { error: validated };

  const { username: displayUsername, email: cleanEmail, password: cleanPassword, role: cleanRole } = validated;

  try {
    if (await isUsernameTaken(displayUsername)) {
      return { error: { field: 'username', message: 'Username already taken' } };
    }

    const { data, error } = await getClient().auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: { data: { username: displayUsername, role: cleanRole } },
    });

    if (error) {
      const msg = error.message ?? '';
      if (/already registered|already exists|already been registered|user already registered/i.test(msg)) {
        const user = await trySignInAfterSignUpFailure(cleanEmail, cleanPassword);
        if (user) return { user };
        return { error: mapSupabaseAuthError(error) };
      }
      return { error: mapSupabaseAuthError(error) };
    }
    if (!data.user) return { error: { field: 'form', message: 'Sign up failed' } };

    if (data.session) {
      const user = await ensureProfile(data.user);
      return { user };
    }

    if (isExistingUserSignUpResponse(data.user)) {
      const user = await trySignInAfterSignUpFailure(cleanEmail, password);
      if (user) return { user };
      return { error: { field: 'email', message: 'Email already taken' } };
    }

    return { error: { field: 'form', message: 'Sign up failed — please try logging in.' } };
  } catch (err) {
    return { error: mapSupabaseAuthError(err) };
  }
}

async function supabaseSignIn({ email, password }) {
  const validated = validateSignInPayload({ email, password });
  if (validated.field) return { error: validated };

  const { data, error } = await getClient().auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('Supabase signIn failed:', error.code ?? error.message);
    }
    return { error: mapSupabaseAuthError(error) };
  }

  if (!data.session?.user) {
    return { error: { field: 'form', message: 'Sign in failed — no session returned.' } };
  }

  const user = await ensureProfile(data.user);
  return { user };
}

function userFromAuthSession(authUser) {
  return toPublicUser({
    auth_id: authUser.id,
    username: authUser.user_metadata?.username ?? '@user',
    email: authUser.email,
    role: authUser.user_metadata?.role ?? 'visitor',
  });
}

export function sameUser(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.username === b.username &&
    a.role === b.role
  );
}

async function supabaseGetSession() {
  const client = getClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return null;

  // Fast path — don't block on DB during initial session read (avoids auth deadlock)
  return userFromAuthSession(session.user);
}

/** Ensure public.users profile row exists for the current session. */
export async function syncSessionProfile() {
  if (!isSupabaseEnabled()) return null;
  const client = getClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return null;
  return ensureProfile(session.user);
}

/* ─── Public API ───────────────────────────────────────── */

export async function getSession() {
  if (isSupabaseEnabled()) return supabaseGetSession();
  return readLocalSession();
}

export async function signUp(payload) {
  if (isSupabaseEnabled()) return supabaseSignUp(payload);
  return localSignUp(payload);
}

export async function signIn(payload) {
  if (isSupabaseEnabled()) return supabaseSignIn(payload);
  return localSignIn(payload);
}

export async function signOut() {
  if (isSupabaseEnabled()) {
    const client = getClient();
    if (client) {
      await client.auth.signOut({ scope: 'local' });
    }
    profileLinkMode = null;
  }
  clearLocalSession();
}

async function localChangePassword({ userId, oldPassword, newPassword, confirmPassword }) {
  const validated = validateChangePasswordPayload({ oldPassword, newPassword, confirmPassword });
  if (validated.field) return { error: validated };

  const users = readUsers();
  const record = users.find(u => u.id === userId);
  if (!record?.password) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const valid = await verifyPassword(validated.oldPassword, record.password.hash, record.password.salt);
  if (!valid) return { error: { field: 'oldPassword', message: 'Incorrect password' } };

  record.password = await createPasswordRecord(validated.newPassword);
  writeUsers(users);
  return { success: true, kind: 'password' };
}

async function supabaseChangePassword(payload) {
  const validated = validateChangePasswordPayload(payload);
  if (validated.field) return { error: validated };

  const client = getClient();
  if (!client) return { error: { field: 'form', message: 'Could not connect to Supabase.' } };

  const { data: { session } } = await client.auth.getSession();
  const email = session?.user?.email;
  if (!email) return { error: { field: 'form', message: 'Could not verify your account.' } };

  const { error: verifyError } = await client.auth.signInWithPassword({
    email,
    password: validated.oldPassword,
  });
  if (verifyError) return { error: { field: 'oldPassword', message: 'Incorrect password' } };

  const { error } = await client.auth.updateUser({ password: validated.newPassword });
  if (error) return { error: mapSupabaseAuthError(error, 'newPassword') };

  await client.auth.refreshSession();

  return { success: true, kind: 'password' };
}

async function localChangeEmail({ userId, oldEmail, newEmail, password }) {
  const validated = validateChangeEmailPayload({ oldEmail, newEmail, password });
  if (validated.field) return { error: validated };

  const users = readUsers();
  const record = users.find(u => u.id === userId);
  if (!record?.password) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  if (normalizeEmail(record.email) !== validated.oldEmail) {
    return { error: { field: 'oldEmail', message: 'Old email does not match your account' } };
  }

  const taken = users.some(
    u => u.id !== userId && normalizeEmail(u.email) === validated.newEmail,
  );
  if (taken) return { error: { field: 'newEmail', message: 'Email already taken' } };

  const valid = await verifyPassword(validated.password, record.password.hash, record.password.salt);
  if (!valid) return { error: { field: 'password', message: 'Incorrect password' } };

  record.email = validated.newEmail;
  writeUsers(users);

  const user = toPublicUser(record);
  if (readLocalSession()?.id === userId) writeLocalSession(userId);
  return { success: true, kind: 'email', user };
}

async function supabaseChangeEmail() {
  return {
    error: {
      field: 'form',
      message: 'Email change is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your .env file.',
    },
  };
}

export async function changePassword(payload) {
  if (isSupabaseEnabled()) return supabaseChangePassword(payload);
  return localChangePassword(payload);
}

export async function changeEmail(payload) {
  if (isSupabaseEnabled()) return supabaseChangeEmail(payload);
  return localChangeEmail(payload);
}

async function localChangeUsername({ userId, username }) {
  const validated = validateChangeUsernamePayload({ username });
  if (validated.field) return { error: validated };

  const users = readUsers();
  const record = users.find(u => u.id === userId);
  if (!record) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const nextClean = validated.value.replace(/^@+/, '').toLowerCase();
  const currentClean = normalizeUsername(record.username);
  if (currentClean === nextClean) {
    return { error: { field: 'username', message: 'Choose a different username' } };
  }

  const taken = users.some(
    u => u.id !== userId && normalizeUsername(u.username) === nextClean,
  );
  if (taken) return { error: { field: 'username', message: 'Username already taken' } };

  record.username = validated.value;
  writeUsers(users);

  const user = toPublicUser(record);
  if (readLocalSession()?.id === userId) writeLocalSession(userId);
  return { success: true, kind: 'username', user };
}

async function supabaseChangeUsername({ username }) {
  const validated = validateChangeUsernamePayload({ username });
  if (validated.field) return { error: validated };

  const client = getClient();
  if (!client) return { error: { field: 'form', message: 'Could not connect to Supabase.' } };

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const currentClean = normalizeUsername(session.user.user_metadata?.username ?? '');
  const nextClean = validated.value.replace(/^@+/, '').toLowerCase();
  if (currentClean === nextClean) {
    return { error: { field: 'username', message: 'Choose a different username' } };
  }

  const { data: existing, error: lookupError } = await getClient()
    .from(USERS_TABLE)
    .select('auth_id')
    .eq('username', validated.value)
    .maybeSingle();

  if (!lookupError && existing?.auth_id && existing.auth_id !== session.user.id) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }

  const { data, error } = await client.auth.updateUser({
    data: { username: validated.value },
  });
  if (error) return { error: mapSupabaseAuthError(error, 'username') };

  if (session.user) {
    await insertProfile({
      authId: session.user.id,
      username: validated.value,
      email: session.user.email ?? '',
      role: session.user.user_metadata?.role ?? 'visitor',
    });
  }

  const user = toPublicUser({
    auth_id: session.user.id,
    username: validated.value,
    email: data.user?.email ?? session.user.email,
    role: session.user.user_metadata?.role ?? 'visitor',
  });

  return { success: true, kind: 'username', user };
}

export async function changeUsername(payload) {
  if (isSupabaseEnabled()) return supabaseChangeUsername(payload);
  return localChangeUsername(payload);
}

export function subscribeToAuthChanges(callback) {
  if (!isSupabaseEnabled()) return () => {};

  const client = getClient();
  if (!client) return () => {};

  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    // INITIAL_SESSION is handled by getSession(); TOKEN_REFRESHED does not change UI state
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;

    setTimeout(async () => {
      if (!session?.user) {
        callback(null);
        return;
      }

      try {
        const user = event === 'SIGNED_IN'
          ? await ensureProfile(session.user)
          : (await fetchProfile(session.user)) ?? userFromAuthSession(session.user);
        callback(user);
      } catch {
        callback(userFromAuthSession(session.user));
      }
    }, 0);
  });

  return () => subscription.unsubscribe();
}
