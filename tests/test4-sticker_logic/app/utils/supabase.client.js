import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

let browserClient = null;

/**
 * Browser Supabase client — localStorage persistence so PKCE verifiers are
 * available when the email-confirm link opens in another tab (same browser).
 * supabase.server.js is kept for route loaders; auth UI uses this client.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createSupabaseClient(getSupabaseUrl(), getSupabaseKey(), {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}

/** Drop cached client after sign-out so the next sign-in starts fresh */
export function resetSupabaseBrowserClient() {
  browserClient = null;
}

/** @deprecated use getSupabaseBrowserClient() — kept for existing imports */
export const supabase = getSupabaseBrowserClient();
