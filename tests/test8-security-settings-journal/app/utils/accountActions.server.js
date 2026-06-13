// validate, verify password via Supabase, update auth + sync profile table -> server-only

import { USERS_TABLE } from './supabase.env';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabase.admin.server';
import {
  normalizeUsername,
  validateChangeEmailPayload,
  validateChangePasswordPayload,
  validateChangeUsernamePayload,
} from './validators';

function mapCredentialError(error, fallbackField = 'form') {
  const msg = error?.message ?? '';
  const code = error?.code ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    return { field: 'password', message: 'Incorrect password' };
  }
  if (/same password|should be different/i.test(msg)) {
    return { field: 'newPassword', message: 'Choose a different password than your current one' };
  }
  if (/already registered|already exists|duplicate|unique/i.test(msg)) {
    if (/username/i.test(msg)) {
      return { field: 'username', message: 'Username already taken' };
    }
    return { field: 'newEmail', message: 'Email already taken' };
  }
  if (/rate limit|over_email_send_rate_limit/i.test(msg)) {
    return { field: 'form', message: 'Too many attempts. Wait a few minutes, then try again.' };
  }
  return { field: fallbackField, message: 'Could not update your account. Please try again.' };
}

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

export async function handleAccountAction(formData, supabase, authUser) {
  const intent = String(formData.get('intent') ?? '').trim();

  if (intent === 'change-password') {
    return changePasswordAction(formData, supabase, authUser);
  }

  if (intent === 'change-email') {
    return changeEmailAction(formData, supabase, authUser);
  }

  if (intent === 'change-username') {
    return changeUsernameAction(formData, supabase, authUser);
  }

  return { error: { field: 'form', message: 'Unknown action.' } };
}

async function changePasswordAction(formData, supabase, authUser) {
  const validated = validateChangePasswordPayload({
    oldPassword: formData.get('oldPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (validated.field) return { error: validated };

  const email = authUser.email;
  if (!email) {
    return { error: { field: 'form', message: 'Could not verify your account.' } };
  }

  const verified = await verifyCurrentPassword(supabase, email, validated.oldPassword);
  if (!verified) {
    return { error: { field: 'oldPassword', message: 'Incorrect password' } };
  }

  const { error } = await supabase.auth.updateUser({ password: validated.newPassword });
  if (error) return { error: mapCredentialError(error, 'newPassword') };

  await supabase.auth.refreshSession();

  return { success: true, kind: 'password' };
}

async function changeEmailAction(formData, supabase, authUser) {
  const validated = validateChangeEmailPayload({
    oldEmail: formData.get('oldEmail'),
    newEmail: formData.get('newEmail'),
    password: formData.get('password'),
  });
  if (validated.field) return { error: validated };

  const currentEmail = String(authUser.email ?? '').toLowerCase();
  if (currentEmail !== validated.oldEmail) {
    return { error: { field: 'oldEmail', message: 'Old email does not match your account' } };
  }

  const verified = await verifyCurrentPassword(supabase, currentEmail, validated.password);
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
    email: validated.newEmail,
    email_confirm: true,
  });
  if (error) return { error: mapCredentialError(error, 'newEmail') };

  const confirmedEmail = validated.newEmail;
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

async function changeUsernameAction(formData, supabase, authUser) {
  const validated = validateChangeUsernamePayload({ username: formData.get('username') });
  if (validated.field) return { error: validated };

  const currentUsername = normalizeUsername(authUser.user_metadata?.username);
  const nextUsername = normalizeUsername(validated.value);
  if (currentUsername === nextUsername) {
    return { error: { field: 'username', message: 'Choose a different username' } };
  }

  if (await isUsernameTakenByOther(supabase, validated.value, authUser.id)) {
    return { error: { field: 'username', message: 'Username already taken' } };
  }

  const { data, error } = await supabase.auth.updateUser({
    data: { username: validated.value },
  });
  if (error) return { error: mapCredentialError(error, 'username') };

  await syncProfileUsername(supabase, authUser.id, validated.value);

  return {
    success: true,
    kind: 'username',
    user: {
      id: authUser.id,
      username: validated.value,
      email: data.user?.email ?? authUser.email,
    },
  };
}
