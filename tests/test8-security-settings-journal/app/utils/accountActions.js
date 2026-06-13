import { bootstrapAuthSession, getAuthSnapshot } from './authSession';
import * as authStore from './authStore';
import { stripControlChars } from './validators';

const ACCOUNT_INTENTS = new Set(['change-password', 'change-email']);

export async function handleAccountActionClient(request) {
  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  if (!user?.id) {
    return { error: { field: 'form', message: 'You must be signed in.' } };
  }

  const formData = await request.formData();
  const intent = stripControlChars(formData.get('intent')).trim();
  if (!ACCOUNT_INTENTS.has(intent)) {
    return { error: { field: 'form', message: 'Unknown action.' } };
  }

  if (intent === 'change-password') {
    return authStore.changePassword({
      userId: user.id,
      oldPassword: formData.get('oldPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });
  }

  return authStore.changeEmail({
    userId: user.id,
    oldEmail: formData.get('oldEmail'),
    newEmail: formData.get('newEmail'),
    confirmEmail: formData.get('confirmEmail'),
    password: formData.get('password'),
  });
}
