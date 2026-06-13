import { data } from 'react-router';
import { createMemoAction } from '../utils/createMemoAction';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { createClient } from '../utils/supabase.server';

export async function action({ request }) {
  const limited = rateLimitActionError(request, 'api:memos', RATE_LIMITS.memos);
  if (limited) {
    return data({ error: limited.error }, { status: limited.status });
  }

  const { supabase, headers } = createClient(request);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return data({ error: 'auth_required' }, { status: 401, headers });
  }

  const result = await createMemoAction(request, {
    client: supabase,
    userId: authData.user.id,
  });

  if (result.error) {
    const status = result.error === 'auth_required' ? 401 : 400;
    return data({ error: result.error }, { status, headers });
  }

  return data(result, { headers });
}
