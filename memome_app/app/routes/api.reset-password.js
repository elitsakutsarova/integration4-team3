import { data } from 'react-router';
import * as authStore from '../utils/authStore';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { resetPasswordByEmailAction } from '../utils/resetPassword.server';
import { isSupabaseConfigured } from '../utils/supabase.env';
import { validateResetPasswordPayload } from '../utils/validators';

/** Legacy API route — reset form posts to /reset-password instead. */
export async function clientAction({ request, serverAction }) {
  const formData = await request.clone().formData();
  const validated = validateResetPasswordPayload({
    newPassword: String(formData.get('newPassword') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });

  if (validated.field) {
    return data({ error: validated });
  }

  if (!isSupabaseConfigured()) {
    const result = await authStore.resetPassword({
      email: String(formData.get('email') ?? ''),
      newPassword: validated.newPassword,
    });
    if (result.error) return data({ error: result.error });
    return data(result);
  }

  return serverAction();
}

export async function action({ request }) {
  const limited = rateLimitActionError(request, 'api:reset-password', RATE_LIMITS.resetPassword);
  if (limited) {
    return data({ error: { field: 'form', message: limited.error } });
  }

  const formData = await request.formData();
  const result = await resetPasswordByEmailAction({
    email: String(formData.get('email') ?? ''),
    newPassword: String(formData.get('newPassword') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });

  if (result.error) return data({ error: result.error });
  return data(result);
}
