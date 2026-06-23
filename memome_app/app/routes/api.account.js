// account API routes for client actions and server actions

import { data } from 'react-router';
import * as authStore from '../utils/authStore';
import { bootstrapAuthSession, getAuthSnapshot } from '../utils/authSession';
import { validateAccountFormData } from '../utils/accountFormValidation';
import { handleAccountAction } from '../utils/accountActions.server';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { createClient } from '../utils/supabase.server';
import { isSupabaseEnabled } from '../utils/supabase.client';
import { clearAccountClientData } from '../utils/accountClientCleanup';

function unwrapActionResult(response) {
  if (!response) return null;
  if (typeof response === 'object' && response.data !== undefined) {
    return response.data;
  }
  return response;
}

function isEmailAdminConfigError(error) {
  const message = String(error?.message ?? '');
  return error?.field === 'form' && /SUPABASE_SERVICE_ROLE_KEY|not configured/i.test(message);
}

async function runChangeEmailClientAction(validation, user, serverAction) {
  const payload = {
    userId: user.id,
    oldEmail: validation.payload.oldEmail,
    newEmail: validation.payload.newEmail,
    password: validation.payload.password,
  };

  if (isSupabaseEnabled()) {
    try {
      const serverResponse = await serverAction();
      const result = unwrapActionResult(serverResponse);
      if (result?.success && result?.kind === 'email') return result;
      if (result?.error && !isEmailAdminConfigError(result.error)) {
        return { error: result.error };
      }
    } catch {
      // Fall through to local dev fallback below.
    }
  }

  return authStore.changeEmail(payload);
}

async function runValidatedClientAction(validation, user) {
  const { intent, payload } = validation;

  if (intent === 'change-password') {
    return authStore.changePassword({
      userId: user.id,
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    });
  }

  if (intent === 'change-email') {
    return authStore.changeEmail({
      userId: user.id,
      oldEmail: payload.oldEmail,
      newEmail: payload.newEmail,
      password: payload.password,
    });
  }

  return authStore.changeUsername({
    userId: user.id,
    username: payload.value,
  });
}

/** Email uses server admin API (immediate, no confirmation mail). Password/username use browser client. */
export async function clientAction({ request, serverAction }) {
  const formData = await request.clone().formData();

  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  const validation = validateAccountFormData(formData, user);
  if (validation.error) {
    return data({ error: validation.error });
  }
  if (!user?.id) {
    return data({ error: { field: 'form', message: 'You must be signed in.' } });
  }

  const intent = validation.intent;

  if (intent === 'delete-account') {
    if (isSupabaseEnabled()) {
      const serverResponse = await serverAction();
      const payload = serverResponse?.data ?? serverResponse;
      if (payload?.error) return data({ error: payload.error });

      clearAccountClientData(user.id);
      return data(payload);
    }

    const result = await authStore.deleteAccount({ userId: user.id });
    if (result.error) return data({ error: result.error });
    return data(result);
  }

  if (intent === 'change-email') {
    const result = await runChangeEmailClientAction(validation, user, serverAction);
    if (result.error) return data({ error: result.error });
    return data(result);
  }

  const result = await runValidatedClientAction(validation, user);
  if (result.error) return data({ error: result.error });
  return data(result);
}

export async function action({ request }) {
  const formData = await request.formData();
  const validation = validateAccountFormData(formData);
  if (validation.error) {
    return data({ error: validation.error });
  }

  const { supabase, headers } = createClient(request);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return data({ error: { field: 'form', message: 'You must be signed in.' } }, { headers });
  }

  const sessionValidation = validateAccountFormData(formData, {
    email: authData.user.email,
    username: authData.user.user_metadata?.username,
  });
  if (sessionValidation.error) {
    return data({ error: sessionValidation.error }, { headers });
  }

  const limited = rateLimitActionError(
    request,
    'api:account',
    RATE_LIMITS.account,
    authData.user.id,
  );
  if (limited) {
    return data(
      { error: { field: 'form', message: limited.error } },
      { headers },
    );
  }

  const result = await handleAccountAction(sessionValidation, supabase, authData.user);
  if (result.error) {
    return data({ error: result.error }, { headers });
  }

  return data(result, { headers });
}
