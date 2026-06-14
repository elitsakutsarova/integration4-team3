// auth engine - logic layer

import { clearAccountClientData } from './accountClientCleanup';
import { isSupabaseEnabled, getSupabaseBrowserClient, USERS_TABLE } from './supabase.client';
import { mapAuthError } from './authErrors';
import {
  clearLocalSession,
  localChangeEmail,
  localChangePassword,
  localChangeUsername,
  localDeleteAccount,
  localSignIn,
  localSignUp,
  readLocalSession,
  toPublicUser,
} from './authStore.local';
import {
  validateChangePasswordPayload,
  validateChangeUsernamePayload,
  validateSignInPayload,
  validateSignUpPayload,
  normalizeUsername,
} from './validators';

/**
 * Auth layer — uses Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set,
 * otherwise falls back to localStorage (current dev stub).
 */

/** If signup already created the user, sign in instead of failing on email rate limit. */
async function trySignInAfterSignUpFailure(email, password) {
  const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
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
    const { data, error } = await getSupabaseBrowserClient()
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

  const { data, error } = await getSupabaseBrowserClient()
    .from(USERS_TABLE)
    .select('id, username, email, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicUser({ ...data, role: 'visitor' }) : null;
}

async function isUsernameTaken(username) {
  const { data, error } = await getSupabaseBrowserClient()
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

  const { data, error } = await getSupabaseBrowserClient().auth.updateUser({ data: nextMeta });
  if (error) {
    console.warn('Could not update auth user metadata:', error.message);
    return authUser;
  }
  return data.user ?? authUser;
}

async function insertProfile({ authId, username, email, role }) {
  if (profileLinkMode === 'legacy') {
    const { error } = await getSupabaseBrowserClient().from(USERS_TABLE).upsert(
      { username, email },
      { onConflict: 'email', ignoreDuplicates: false },
    );
    if (error && !/duplicate|unique|already exists|no unique|constraint/i.test(error.message)) {
      // email may not be unique — fall back to plain insert
      const { error: insertError } = await getSupabaseBrowserClient().from(USERS_TABLE).insert({ username, email });
      if (insertError && !/duplicate|unique|already exists/i.test(insertError.message)) throw insertError;
    }
    return;
  }

  const { error: rpcError } = await getSupabaseBrowserClient().rpc('upsert_own_profile', {
    p_username: username,
    p_email: email,
    p_role: role,
  });

  if (!rpcError) return;

  if (/Could not find the function|42883|PGRST202/i.test(rpcError.message ?? '')) {
    console.warn('[MemMe] Run supabase/fix-users-rls.sql in Supabase SQL Editor, then retry.');
  }

  const { error } = await getSupabaseBrowserClient().from(USERS_TABLE).upsert(
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

    const { data, error } = await getSupabaseBrowserClient().auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: { data: { username: displayUsername, role: cleanRole } },
    });

    if (error) {
      const msg = error.message ?? '';
      if (/already registered|already exists|already been registered|user already registered/i.test(msg)) {
        const user = await trySignInAfterSignUpFailure(cleanEmail, cleanPassword);
        if (user) return { user };
        return { error: mapAuthError(error) };
      }
      return { error: mapAuthError(error) };
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
    return { error: mapAuthError(err) };
  }
}

async function supabaseSignIn({ email, password }) {
  const validated = validateSignInPayload({ email, password });
  if (validated.field) return { error: validated };

  const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('Supabase signIn failed:', error.code ?? error.message);
    }
    return { error: mapAuthError(error) };
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
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return null;

  // Fast path — don't block on DB during initial session read (avoids auth deadlock)
  return userFromAuthSession(session.user);
}

/** Ensure public.users profile row exists for the current session. */
export async function syncSessionProfile() {
  if (!isSupabaseEnabled()) return null;
  const client = getSupabaseBrowserClient();
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
    const client = getSupabaseBrowserClient();
    if (client) {
      await client.auth.signOut({ scope: 'local' });
    }
    profileLinkMode = null;
  }
  clearLocalSession();
}

async function supabaseChangePassword(payload) {
  const validated = validateChangePasswordPayload(payload);
  if (validated.field) return { error: validated };

  const client = getSupabaseBrowserClient();
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
  if (error) return { error: mapAuthError(error, 'newPassword') };

  await client.auth.refreshSession();

  return { success: true, kind: 'password' };
}

export async function changePassword(payload) {
  if (isSupabaseEnabled()) return supabaseChangePassword(payload);
  return localChangePassword(payload);
}

/** Email change always goes through the server action (admin API). Local-only fallback for dev. */
export async function changeEmail(payload) {
  return localChangeEmail(payload);
}

async function supabaseChangeUsername({ username }) {
  const validated = validateChangeUsernamePayload({ username });
  if (validated.field) return { error: validated };

  const client = getSupabaseBrowserClient();
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

  const { data: existing, error: lookupError } = await getSupabaseBrowserClient()
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
  if (error) return { error: mapAuthError(error, 'username') };

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

export async function deleteAccount({ userId }) {
  if (isSupabaseEnabled()) {
    return { error: { field: 'form', message: 'Account deletion must run on the server.' } };
  }

  const result = await localDeleteAccount(userId);
  if (result.error) return result;

  clearAccountClientData(userId);
  return result;
}

export { clearAccountClientData };

export function subscribeToAuthChanges(callback) {
  if (!isSupabaseEnabled()) return () => {};

  const client = getSupabaseBrowserClient();
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
