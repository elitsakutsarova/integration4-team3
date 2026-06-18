import { createClient } from '@supabase/supabase-js';
import { mapAuthError } from './authErrors';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabase.admin.server';
import { getSupabaseKey, getSupabaseUrl } from './supabase.env';
import {
  NEW_PASSWORD_SAME_AS_OLD_MESSAGE,
  normalizeEmail,
  validateEmail,
  validateResetPasswordPayload,
} from './validators';

async function canSignInWithPassword(email, password) {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return false;

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  return !error;
}

async function findAuthUserByEmail(admin, email) {
  const normalized = normalizeEmail(email);
  let page = 1;

  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find(
      (user) => normalizeEmail(user.email ?? '') === normalized,
    );
    if (match) return match;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

export async function resetPasswordByEmailAction({ email, newPassword, confirmPassword }) {
  const emailResult = validateEmail(email);
  if (emailResult.field) {
    return { error: { field: 'form', message: 'Enter a valid email address.' } };
  }

  const validated = validateResetPasswordPayload({ newPassword, confirmPassword });
  if (validated.field) return { error: validated };

  if (!isSupabaseAdminConfigured()) {
    return {
      error: {
        field: 'form',
        message: 'Password reset is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your .env file.',
      },
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { error: { field: 'form', message: 'Password reset is not available.' } };
  }

  const authUser = await findAuthUserByEmail(admin, emailResult.value);
  if (!authUser) {
    return { error: { field: 'form', message: 'Could not reset password for this account.' } };
  }

  if (await canSignInWithPassword(emailResult.value, validated.newPassword)) {
    return { error: { field: 'newPassword', message: NEW_PASSWORD_SAME_AS_OLD_MESSAGE } };
  }

  const { error } = await admin.auth.admin.updateUserById(authUser.id, {
    password: validated.newPassword,
  });
  if (error) return { error: mapAuthError(error, 'newPassword') };

  const passwordWorks = await canSignInWithPassword(emailResult.value, validated.newPassword);
  if (!passwordWorks) {
    return { error: { field: 'form', message: 'Password was not updated. Please try again.' } };
  }

  return { success: true, kind: 'password', email: emailResult.value };
}
