/** Canonical app origin — always http://localhost:5173 in local dev */
export const APP_ORIGIN =
  import.meta.env.VITE_APP_ORIGIN ?? 'http://localhost:5173';

export function appUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_ORIGIN}${normalized}`;
}
