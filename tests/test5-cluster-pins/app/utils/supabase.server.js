import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import { getSupabaseKey, getSupabaseUrl, isSupabaseConfigured } from './supabase.env';

export { isSupabaseConfigured };

/**
 * Supabase client for React Router loaders/actions (server).
 * Returns refreshed auth cookies via `headers` — pass to `data(..., { headers })`.
 */
export function createClient(request) {
  const headers = new Headers();
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options));
        });
      },
    },
  });

  return { supabase, headers };
}
