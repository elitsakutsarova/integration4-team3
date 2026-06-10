// auth engine - logic layer

import { APP_ORIGIN, appUrl } from '../config';
import { isSupabaseEnabled, getSupabaseBrowserClient, resetSupabaseBrowserClient, USERS_TABLE } from './supabase.client';

function getClient() {
  return getSupabaseBrowserClient();
}

/**
 * Auth layer — uses Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set,
 * otherwise falls back to localStorage (current dev stub).
 */

const USERS_KEY = 'memome_users';
const SESSION_KEY = 'memome_session';

function normalizeUsername(raw) {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

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
  if (users.some(u => normalizeUsername(u.username) === cleanUsername)) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }
  if (users.some(u => u.email === cleanEmail)) {
    return { error: { field: 'email', message: 'Email already taken' } };
  }

  const { hash, salt } = await createPasswordRecord(password);
  const record = {
    id: crypto.randomUUID(),
    username: formatUsername(cleanUsername),
    email: cleanEmail,
    passwordHash: hash,
    salt,
    role,
    collections: { memos: 0, faves: 0 },
    createdAt: new Date().toISOString(),
  };

  users.push(record);
  writeUsers(users);
  writeLocalSession(record.id);
  return { user: toPublicUser(record) };
}

async function localSignIn({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const record = readUsers().find(u => u.email === cleanEmail);

  if (!record) {
    return { error: { field: 'email', message: 'No account found with this email' } };
  }

  const valid = await verifyPassword(password, record.passwordHash, record.salt);
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

  if (code === 'email_not_confirmed' || /email.*confirm|not confirmed/i.test(msg)) {
    return {
      field: 'form',
      message: 'Confirm your email first, then log in.',
    };
  }
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    return {
      field: 'form',
      message: 'Incorrect email or password. If you just signed up, confirm your email first.',
    };
  }
  if (/rate limit|over_email_send_rate_limit/i.test(msg)) {
    return {
      field: 'form',
      message: 'Too many emails were sent. Wait a few minutes, then try logging in.',
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

/** Supabase returns success with empty identities when the email is already registered — no mail is sent. */
function isExistingUserSignUpResponse(user) {
  return (user?.identities ?? []).length === 0;
}

async function sendSignupConfirmationEmail(email) {
  const { error } = await getClient().auth.resend({
    type: 'signup',
    email: normalizeEmail(email),
    options: { emailRedirectTo: appUrl('/auth/callback') },
  });
  if (error) return { error: mapSupabaseAuthError(error) };
  return { ok: true };
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
  const cleanUsername = normalizeUsername(username);
  const cleanEmail = normalizeEmail(email);
  const displayUsername = formatUsername(cleanUsername);

  if (!cleanUsername) {
    return { error: { field: 'username', message: 'Username is required' } };
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: { field: 'email', message: 'Enter a valid email address' } };
  }
  if (!role) {
    return { error: { field: 'role', message: 'Please select Visitor or Local to continue' } };
  }

  try {
    if (await isUsernameTaken(displayUsername)) {
      return { error: { field: 'username', message: 'Username already taken' } };
    }

    const { data, error } = await getClient().auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { username: displayUsername, role },
        emailRedirectTo: appUrl('/auth/callback'),
      },
    });

    if (error) {
      const msg = error.message ?? '';
      if (/already registered|already exists|already been registered|user already registered/i.test(msg)) {
        const resend = await sendSignupConfirmationEmail(cleanEmail);
        if (!resend.error) {
          return {
            pendingConfirmation: true,
            message: 'This email is already registered. We sent a new confirmation link — check your inbox and spam folder.',
          };
        }
        const user = await trySignInAfterSignUpFailure(cleanEmail, password);
        if (user) return { user };
        return { error: resend.error ?? mapSupabaseAuthError(error) };
      }
      if (/rate limit|over_email_send_rate_limit/i.test(msg)) {
        const user = await trySignInAfterSignUpFailure(cleanEmail, password);
        if (user) return { user };
        return {
          pendingConfirmation: true,
          message: 'Too many emails were sent recently. Wait a few minutes, then try logging in or use “Resend confirmation email” on the login page.',
        };
      }
      return { error: mapSupabaseAuthError(error) };
    }
    if (!data.user) return { error: { field: 'form', message: 'Sign up failed' } };

    // Profile insert needs an active session (RLS). With email confirmation,
    // that happens after the user clicks the link — ensureProfile runs then.
    if (data.session) {
      const user = await ensureProfile(data.user);
      return { user };
    }

    if (isExistingUserSignUpResponse(data.user)) {
      const resend = await sendSignupConfirmationEmail(cleanEmail);
      if (resend.error) {
        const user = await trySignInAfterSignUpFailure(cleanEmail, password);
        if (user) return { user };
        return { error: resend.error };
      }
      return {
        pendingConfirmation: true,
        message: 'This email is already registered. We sent a new confirmation link — check your inbox and spam folder.',
      };
    }

    return {
      pendingConfirmation: true,
      message: 'Check your email to confirm your account, then log in.',
    };
  } catch (err) {
    return { error: mapSupabaseAuthError(err) };
  }
}

async function supabaseSignIn({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  const { data, error } = await getClient().auth.signInWithPassword({
    email: cleanEmail,
    password,
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

/** Call after OAuth / email-confirm redirect to persist profile row. */
export async function syncSessionProfile() {
  if (!isSupabaseEnabled()) return null;
  const client = getClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return null;
  return ensureProfile(session.user);
}

/** Exchange ?code= / token_hash from /auth/callback before syncing profile. */
export async function completeAuthRedirect() {
  const client = getClient();
  if (!client) return { error: 'Supabase is not configured.' };

  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const authError =
    params.get('error_description') ??
    params.get('error') ??
    hashParams.get('error_description') ??
    hashParams.get('error');
  if (authError) return { error: authError };

  const { data: { session: existing } } = await client.auth.getSession();
  if (existing?.user) return { ok: true };

  const token_hash = params.get('token_hash');
  const type = params.get('type');
  if (token_hash && type) {
    const { error } = await client.auth.verifyOtp({ token_hash, type });
    if (error) return { error: error.message };
    return { ok: true };
  }

  const code = params.get('code');
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      const msg = /PKCE|code verifier/i.test(error.message ?? '')
        ? 'Email confirmation could not finish in this tab. Log in with your email and password. If needed, use “Resend confirmation email”.'
        : (error.message ?? 'Confirmation failed');
      return { error: msg };
    }
    return { ok: true };
  }

  if (hashParams.get('access_token')) {
    const { data: { session } } = await client.auth.getSession();
    if (session?.user) return { ok: true };
  }

  return { error: 'Missing confirmation data. Try logging in instead.' };
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

export async function signInWithGoogle() {
  if (!isSupabaseEnabled()) {
    return {
      error: {
        field: 'form',
        message: `Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env first. Redirect URL: ${APP_ORIGIN}`,
      },
    };
  }

  const { error } = await getClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: appUrl('/auth/callback') },
  });

  if (error) return { error: mapSupabaseAuthError(error) };
  return {};
}

export async function signOut() {
  if (isSupabaseEnabled()) {
    const client = getClient();
    if (client) {
      await client.auth.signOut({ scope: 'local' });
    }
    resetSupabaseBrowserClient();
    profileLinkMode = null;
  }
  clearLocalSession();
}

/** Resend signup confirmation (e.g. after re-enabling “Confirm email” in Supabase). */
export async function resendConfirmationEmail(email) {
  if (!isSupabaseEnabled()) {
    return { error: { field: 'form', message: 'Supabase is not configured.' } };
  }
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: { field: 'email', message: 'Enter a valid email address' } };
  }
  const result = await sendSignupConfirmationEmail(cleanEmail);
  if (result.error) return { error: result.error };
  return {
    pendingConfirmation: true,
    message: 'Confirmation email sent. Check your inbox and spam folder.',
  };
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
