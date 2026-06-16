/** Shared Supabase env — VITE_* vars are substituted at build time by Vite for both client and server */

function env(name) {
  try {
    // Try import.meta.env first (available in both client and server bundles after Vite build)
    if (typeof import.meta !== 'undefined' && import.meta.env && name in import.meta.env) {
      return import.meta.env[name] || '';
    }
  } catch {
    // import.meta might not be available in some contexts
  }

  try {
    // Fallback to process.env for Node.js runtime
    if (typeof process !== 'undefined' && process.env && name in process.env) {
      return process.env[name] || '';
    }
  } catch {
    // process might not be available in some contexts
  }

  return '';
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
export const FEEDBACK_TABLE = env('VITE_SUPABASE_FEEDBACK_TABLE') || 'feedback';
