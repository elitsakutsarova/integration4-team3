import { data } from 'react-router';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { resetPasswordByEmailAction } from '../utils/resetPassword.server';

export async function action({ request }) {
  const limited = rateLimitActionError(request, 'reset-password', RATE_LIMITS.resetPassword);
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
