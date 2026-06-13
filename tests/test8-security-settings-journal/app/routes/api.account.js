// account API routes for client actions and server actions

import { data } from 'react-router';
import { bootstrapAuthSession, getAuthSnapshot } from '../utils/authSession';
import { signInAccount } from '../utils/authActions';
import { handleAccountActionClient } from '../utils/accountActions';
import { validateAccountFormData } from '../utils/accountFormValidation';
import { handleAccountAction } from '../utils/accountActions.server';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { createClient } from '../utils/supabase.server';

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

  const intent = String(formData.get('intent') ?? '').trim();

  if (intent === 'change-email') {
    const serverResponse = await serverAction();
    const payload = serverResponse?.data ?? serverResponse;
    if (payload?.error) return data({ error: payload.error });

    const password = validation.payload?.password;
    if (payload?.success && payload?.user?.email && password) {
      const signIn = await signInAccount({
        email: payload.user.email,
        password,
      });
      if (signIn.user) {
        return data({ ...payload, user: signIn.user });
      }
    }

    return data(payload);
  }

  const result = await handleAccountActionClient(formData, user);
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

  const result = await handleAccountAction(formData, supabase, authData.user);
  if (result.error) {
    return data({ error: result.error }, { headers });
  }

  return data(result, { headers });
}
