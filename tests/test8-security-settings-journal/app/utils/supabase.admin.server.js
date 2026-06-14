/** Server-only Supabase admin client — never import from client components. */

import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from './supabase.env';

let adminClient = null;

function getServiceRoleKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
}

export function isSupabaseAdminConfigured() {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

export function getSupabaseAdmin() {
  if (!isSupabaseAdminConfigured()) return null;

  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getServiceRoleKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return adminClient;
}
