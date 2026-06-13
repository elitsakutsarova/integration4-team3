// shared account form validation for client actions and UI

import {
  validateChangeEmailPayload,
  validateChangePasswordPayload,
  validateChangeUsernamePayload,
} from './validators';

const ACCOUNT_INTENTS = new Set(['change-password', 'change-email', 'change-username']);

export function accountErrorToFieldMap(error) {
  if (!error) return {};
  if (error.field) return { [error.field]: error.message };
  return { form: error.message };
}

function normalizeUsernameValue(username) {
  return String(username ?? '').trim().replace(/^@+/, '').toLowerCase();
}

/** Shared account form validation for client actions and UI. */
export function validateAccountFormData(formData, currentUser = null) {
  const intent = String(formData.get('intent') ?? '').trim();
  if (!ACCOUNT_INTENTS.has(intent)) {
    return { error: { field: 'form', message: 'Unknown action.' } };
  }

  if (intent === 'change-password') {
    const result = validateChangePasswordPayload({
      oldPassword: formData.get('oldPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });
    if (result.field) return { error: result };
    return { ok: true, intent, payload: result };
  }

  if (intent === 'change-email') {
    const result = validateChangeEmailPayload({
      oldEmail: formData.get('oldEmail'),
      newEmail: formData.get('newEmail'),
      password: formData.get('password'),
    });
    if (result.field) return { error: result };

    const currentEmail = String(currentUser?.email ?? '').toLowerCase();
    if (currentEmail && result.oldEmail !== currentEmail) {
      return { error: { field: 'oldEmail', message: 'Old email does not match your account' } };
    }

    return { ok: true, intent, payload: result };
  }

  const result = validateChangeUsernamePayload({ username: formData.get('username') });
  if (result.field) return { error: result };

  const currentUsername = normalizeUsernameValue(currentUser?.username);
  const nextUsername = normalizeUsernameValue(result.value);
  if (currentUsername && currentUsername === nextUsername) {
    return { error: { field: 'username', message: 'Choose a different username' } };
  }

  return { ok: true, intent, payload: result };
}
