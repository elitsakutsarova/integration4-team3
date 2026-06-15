import { data } from 'react-router';
import { bootstrapAuthSession } from '../utils/authSession';
import { rateLimitActionError, RATE_LIMITS } from '../utils/rateLimit.server';
import { submitFeedbackAction } from '../utils/submitFeedbackAction';
import { isSupabaseConfigured } from '../utils/supabase.env';
import { createClient } from '../utils/supabase.server';

export async function clientAction({ request, serverAction }) {
  if (isSupabaseConfigured()) {
    return serverAction();
  }

  await bootstrapAuthSession();
  const result = await submitFeedbackAction(request);
  if (result.error) return data({ error: result.error, fieldErrors: result.fieldErrors });
  return data(result);
}

export async function action({ request }) {
  const limited = rateLimitActionError(request, 'api:feedback', RATE_LIMITS.feedback);
  if (limited) {
    return data(
      { error: { field: 'form', message: limited.error }, fieldErrors: { form: limited.error } },
      { status: limited.status },
    );
  }

  const { supabase, headers } = createClient(request);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return data(
      { error: { field: 'form', message: 'You must be signed in.' }, fieldErrors: { form: 'You must be signed in.' } },
      { headers },
    );
  }

  const limitedUser = rateLimitActionError(
    request,
    'api:feedback',
    RATE_LIMITS.feedback,
    authData.user.id,
  );
  if (limitedUser) {
    return data(
      { error: { field: 'form', message: limitedUser.error }, fieldErrors: { form: limitedUser.error } },
      { headers, status: limitedUser.status },
    );
  }

  const result = await submitFeedbackAction(request, {
    client: supabase,
    userId: authData.user.id,
  });

  if (result.error) {
    return data({ error: result.error, fieldErrors: result.fieldErrors }, { headers });
  }

  return data(result, { headers });
}
