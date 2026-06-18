/** Map Supabase/auth credential errors to form field messages. */

export function mapAuthError(error, fallbackField = 'form') {
  const msg = error?.message ?? 'Something went wrong';
  const code = error?.code ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    if (fallbackField === 'oldPassword') {
      return { field: 'oldPassword', message: 'Incorrect password' };
    }
    if (fallbackField === 'password') {
      return { field: 'password', message: 'Incorrect password' };
    }
    return { field: 'form', message: 'Incorrect email or password.' };
  }

  if (/same password|should be different/i.test(msg)) {
    return { field: 'newPassword', message: 'Choose a different password than your current one' };
  }

  if (/already registered|already exists|duplicate|unique/i.test(msg)) {
    if (/username/i.test(msg)) {
      return { field: 'username', message: 'Username already taken' };
    }
    if (fallbackField === 'newEmail') {
      return { field: 'newEmail', message: 'Email already taken' };
    }
    return { field: 'email', message: 'Email already taken' };
  }

  if (/rate limit|over_email_send_rate_limit/i.test(msg)) {
    return { field: 'form', message: 'Too many attempts. Wait a few minutes, then try again.' };
  }

  if (/username already taken/i.test(msg)) {
    return { field: 'username', message: 'Username already taken' };
  }

  if (/email already taken/i.test(msg)) {
    return { field: 'email', message: 'Email already taken' };
  }

  if (/database error saving new user/i.test(msg)) {
    return {
      field: 'form',
      message: 'We could not finish creating your account. Try a different email or username.',
    };
  }

  if (/profile already exists/i.test(msg)) {
    if (/username/i.test(msg)) {
      return { field: 'username', message: 'Username already taken' };
    }
    return { field: 'email', message: 'Email already taken' };
  }

  if (/username/i.test(msg)) {
    return { field: 'username', message: msg };
  }

  if (fallbackField === 'form') {
    return { field: 'form', message: msg };
  }

  return { field: fallbackField, message: 'Could not update your account. Please try again.' };
}
