import { data } from 'react-router';
import { handleAccountActionClient } from '../utils/accountActions';
import { handleAccountAction } from '../utils/accountActions.server';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { isSupabaseConfigured } from '../utils/supabase.env';
import { createClient } from '../utils/supabase.server';

export async function clientAction({ request, serverAction }) {
  if (isSupabaseConfigured()) {
    return serverAction();
  }

  const result = await handleAccountActionClient(request);
  if (result.error) return data({ error: result.error });
  return data(result);
}

export async function action({ request }) {
  const limited = rateLimitActionError(request, 'api:account', RATE_LIMITS.account);
  if (limited) {
    return data({ error: { field: 'form', message: limited.error } }, { status: limited.status });
  }

  const { supabase, headers } = createClient(request);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return data({ error: { field: 'form', message: 'You must be signed in.' } }, { headers });
  }

  const result = await handleAccountAction(request, supabase, authData.user);
  if (result.error) {
    return data({ error: result.error }, { headers });
  }

  return data(result, { headers });
}
