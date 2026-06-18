import { data } from 'react-router';
import { bootstrapAuthSession } from '../utils/authSession';
import { createMemoAction } from '../utils/createMemoAction';
import { updateMemoAction } from '../utils/updateMemoAction';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { isSupabaseConfigured } from '../utils/supabase.env';
import { createClient } from '../utils/supabase.server';
import { stripControlChars } from '../utils/validators';

async function runMemoAction(request, serverContext) {
  const formData = await request.formData();
  const intent = stripControlChars(formData.get('intent')).trim();

  if (intent === 'update-memo') {
    return updateMemoAction(formData, serverContext);
  }

  return createMemoAction(formData, serverContext);
}

export async function clientAction({ request, serverAction }) {
  if (isSupabaseConfigured()) {
    return serverAction();
  }

  await bootstrapAuthSession();
  const formData = await request.formData();
  const intent = stripControlChars(formData.get('intent')).trim();

  if (intent === 'update-memo') {
    return updateMemoAction(formData);
  }

  return createMemoAction(formData);
}

export async function action({ request }) {
  const limited = rateLimitActionError(request, 'api:memos', RATE_LIMITS.memos);
  if (limited) {
    return data({ error: limited.error }, { status: limited.status });
  }

  const { supabase, headers } = createClient(request);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return data({ error: 'auth_required' }, { headers });
  }

  const result = await runMemoAction(request, {
    client: supabase,
    userId: authData.user.id,
  });

  if (result.error) {
    return data({ error: result.error }, { headers });
  }

  return data(result, { headers });
}
