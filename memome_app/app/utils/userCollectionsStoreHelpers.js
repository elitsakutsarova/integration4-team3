import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';

/** Uses caller-provided auth id when available; only hits Supabase session for guests. */
export async function resolveAccountAuthId(hintAuthUserId) {
  if (hintAuthUserId) return hintAuthUserId;
  if (!isSupabaseEnabled()) return null;

  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  return session?.user?.id ?? null;
}

/**
 * Runs a Supabase operation when enabled and authenticated; otherwise falls back to local.
 * Any thrown error or explicit `{ error }` result triggers the local fallback.
 */
export async function withSupabaseOrLocal(authUserId, supabaseFn, localFn) {
  const accountId = await resolveAccountAuthId(authUserId);
  if (!(accountId && isSupabaseEnabled())) return localFn();

  const client = getSupabaseBrowserClient();
  if (!client) return localFn();

  try {
    const result = await supabaseFn(client, accountId);
    if (result?.error) return localFn();
    return result;
  } catch {
    return localFn();
  }
}
