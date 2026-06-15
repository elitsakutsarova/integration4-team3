import { createBrowserClient } from '@supabase/ssr';
import {
  getSupabaseKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  USERS_TABLE,
} from './supabase.env';

export { USERS_TABLE };

export function isSupabaseEnabled() {
  return isSupabaseConfigured();
}

const GLOBAL_CLIENT_KEY = '__memome_supabase_browser__';

function readCachedClient() {
  if (typeof globalThis === 'undefined') return null;
  return globalThis[GLOBAL_CLIENT_KEY] ?? null;
}

function writeCachedClient(client) {
  if (typeof globalThis !== 'undefined') {
    globalThis[GLOBAL_CLIENT_KEY] = client;
  }
}

/** Single browser Supabase client — survives Vite HMR without duplicating GoTrue. */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  const cached = readCachedClient();
  if (cached) return cached;

  const client = createBrowserClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  writeCachedClient(client);
  return client;
}
