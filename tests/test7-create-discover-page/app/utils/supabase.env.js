/** Shared Supabase env — Vite exposes VITE_* vars via import.meta.env on client and SSR */

function env(name) {
  return import.meta.env[name] ?? '';
}

export function getSupabaseUrl() {
  return env('VITE_SUPABASE_URL');
}

export function getSupabaseKey() {
  const key = env('VITE_SUPABASE_PUBLISHABLE_KEY') || env('VITE_SUPABASE_ANON_KEY');
  return key.trim();
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

export const USERS_TABLE = env('VITE_SUPABASE_USERS_TABLE') || 'users';
