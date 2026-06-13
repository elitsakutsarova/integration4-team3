// client-side account actions for client actions and server actions

import * as authStore from './authStore';
import { validateAccountFormData } from './accountFormValidation';
import { stripControlChars } from './validators';

export async function handleAccountActionClient(formData, user) {
  const validation = validateAccountFormData(formData, user);
  if (validation.error) return { error: validation.error };

  const intent = stripControlChars(formData.get('intent')).trim();

  if (intent === 'change-password') {
    return authStore.changePassword({
      userId: user.id,
      oldPassword: formData.get('oldPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });
  }

  if (intent === 'change-email') {
    return authStore.changeEmail({
      userId: user.id,
      oldEmail: formData.get('oldEmail'),
      newEmail: formData.get('newEmail'),
      password: formData.get('password'),
    });
  }

  return authStore.changeUsername({
    userId: user.id,
    username: formData.get('username'),
  });
}
