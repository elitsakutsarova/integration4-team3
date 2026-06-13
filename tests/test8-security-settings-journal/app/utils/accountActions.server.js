import { USERS_TABLE } from './supabase.env';
import {
  validateChangeEmailPayload,
  validateChangePasswordPayload,
} from './validators';

const ACCOUNT_INTENTS = new Set(['change-password', 'change-email']);

function mapCredentialError(error, fallbackField = 'form') {
  const msg = error?.message ?? '';
  const code = error?.code ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    return { field: 'password', message: 'Incorrect password' };
  }
  if (/same password|should be different/i.test(msg)) {
    return { field: 'newPassword', message: 'Choose a different password than your current one' };
  }
  if (/already registered|already exists|duplicate/i.test(msg)) {
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

export async function handleAccountAction(request, supabase, authUser) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '').trim();

  if (!ACCOUNT_INTENTS.has(intent)) {
    return { error: { field: 'form', message: 'Unknown action.' } };
  }

  if (intent === 'change-password') {
    return changePasswordAction(formData, supabase, authUser);
  }

  return changeEmailAction(formData, supabase, authUser);
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

  return { success: true, kind: 'password' };
}

async function changeEmailAction(formData, supabase, authUser) {
  const validated = validateChangeEmailPayload({
    oldEmail: formData.get('oldEmail'),
    newEmail: formData.get('newEmail'),
    confirmEmail: formData.get('confirmEmail'),
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

  const { data, error } = await supabase.auth.updateUser({ email: validated.newEmail });
  if (error) return { error: mapCredentialError(error, 'newEmail') };

  const nextEmail = data.user?.email ?? validated.newEmail;
  await syncProfileEmail(supabase, authUser.id, nextEmail);

  return {
    success: true,
    kind: 'email',
    pendingConfirmation: nextEmail.toLowerCase() !== validated.newEmail,
    user: {
      id: authUser.id,
      email: nextEmail,
      username: data.user?.user_metadata?.username ?? null,
    },
  };
}
