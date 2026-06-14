// validate, verify password via Supabase, update auth + sync profile table -> server-only

import { mapAuthError } from './authErrors';
import { USERS_TABLE } from './supabase.env';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabase.admin.server';
import { normalizeEmail, normalizeUsername } from './validators';

async function verifyCurrentPassword(supabase, email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

async function syncProfileEmail(supabase, authId, email) {
  const { error } = await supabase
    .from(USERS_TABLE)
    .update({ email })
    .eq('auth_id', authId);

  if (error && !/does not exist|42703/i.test(error.message ?? '')) {
    console.warn('[MemMe] Could not sync profile email:', error.message);
  }
}

async function syncProfileUsername(supabase, authId, username) {
  const { error } = await supabase
    .from(USERS_TABLE)
    .update({ username })
    .eq('auth_id', authId);

  if (error && !/does not exist|42703/i.test(error.message ?? '')) {
    console.warn('[MemMe] Could not sync profile username:', error.message);
  }
}

async function isUsernameTakenByOther(supabase, username, authId) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('auth_id')
    .eq('username', username)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.auth_id && data.auth_id !== authId);
}

export async function handleAccountAction(validation, supabase, authUser) {
  const { intent, payload } = validation;

  if (intent === 'change-password') {
    return changePasswordAction(payload, supabase, authUser);
  }

  if (intent === 'change-email') {
    return changeEmailAction(payload, supabase, authUser);
  }

  if (intent === 'change-username') {
    return changeUsernameAction(payload, supabase, authUser);
  }

  if (intent === 'delete-account') {
    return deleteAccountAction(supabase, authUser);
  }

  return { error: { field: 'form', message: 'Unknown action.' } };
}

async function deleteProfileRow(supabase, authId) {
  const { error } = await supabase.from(USERS_TABLE).delete().eq('auth_id', authId);
  if (error && !/does not exist|42703/i.test(error.message ?? '')) {
    console.warn('[MemMe] Could not delete profile row:', error.message);
  }
}

async function deleteAccountAction(supabase, authUser) {
  if (!isSupabaseAdminConfigured()) {
    return {
      error: {
        field: 'form',
        message: 'Account deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your .env file.',
      },
    };
  }

  const admin = getSupabaseAdmin();
  await deleteProfileRow(admin, authUser.id);

  const { error } = await admin.auth.admin.deleteUser(authUser.id);
  if (error) return { error: mapAuthError(error, 'form') };

  await supabase.auth.signOut();

  return { success: true, kind: 'delete-account', deleted: true };
}

async function changePasswordAction(payload, supabase, authUser) {
  const email = authUser.email;
  if (!email) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const verified = await verifyCurrentPassword(supabase, email, payload.oldPassword);
  if (!verified) {
    return { error: { field: 'oldPassword', message: 'Incorrect password' } };
  }

  const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
  if (error) return { error: mapAuthError(error, 'newPassword') };

  await supabase.auth.refreshSession();

  return { success: true, kind: 'password' };
}

async function changeEmailAction(payload, supabase, authUser) {
  const currentEmail = normalizeEmail(authUser.email ?? '');
  if (currentEmail !== payload.oldEmail) {
    return { error: { field: 'oldEmail', message: 'Old email does not match your account' } };
  }

  const verified = await verifyCurrentPassword(supabase, currentEmail, payload.password);
  if (!verified) {
    return { error: { field: 'password', message: 'Incorrect password' } };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      error: {
        field: 'form',
        message: 'Email change is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your .env file.',
      },
    };
  }

  const admin = getSupabaseAdmin();
  const { data: updated, error } = await admin.auth.admin.updateUserById(authUser.id, {
    email: payload.newEmail,
    email_confirm: true,
  });
  if (error) return { error: mapAuthError(error, 'newEmail') };

  const confirmedEmail = payload.newEmail;
  await syncProfileEmail(supabase, authUser.id, confirmedEmail);

  return {
    success: true,
    kind: 'email',
    pendingConfirmation: false,
    user: {
      id: authUser.id,
      email: confirmedEmail,
      username: updated.user?.user_metadata?.username ?? authUser.user_metadata?.username ?? null,
    },
  };
}

async function changeUsernameAction(payload, supabase, authUser) {
  const currentUsername = normalizeUsername(authUser.user_metadata?.username);
  const nextUsername = normalizeUsername(payload.value);
  if (currentUsername === nextUsername) {
    return { error: { field: 'username', message: 'Choose a different username' } };
  }

  if (await isUsernameTakenByOther(supabase, payload.value, authUser.id)) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }

  const { data, error } = await supabase.auth.updateUser({
    data: { username: payload.value },
  });
  if (error) return { error: mapAuthError(error, 'username') };

  await syncProfileUsername(supabase, authUser.id, payload.value);

  return {
    success: true,
    kind: 'username',
    user: {
      id: authUser.id,
      username: payload.value,
      email: data.user?.email ?? authUser.email,
    },
  };
}
