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

let browserClient = null;

/** Browser Supabase client — pairs with supabase.server.js for SSR cookie auth */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseKey());
  }
  return browserClient;
}

/** Drop cached client after sign-out so the next sign-in starts fresh */
export function resetSupabaseBrowserClient() {
  browserClient = null;
}

/** @deprecated use getSupabaseBrowserClient() — kept for existing imports */
export const supabase = getSupabaseBrowserClient();

