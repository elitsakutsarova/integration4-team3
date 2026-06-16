/** When true, dev server listens on LAN and root clientLoader does not force localhost. */
function getEnv(name) {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return import.meta.env?.[name];
}

export const ALLOW_LAN = getEnv('VITE_ALLOW_LAN') === 'true';

/** Canonical app origin for auth redirects (localhost in dev). */
export const APP_ORIGIN =
  getEnv('VITE_APP_ORIGIN') ??
  (ALLOW_LAN ? 'https://localhost:5173' : 'http://localhost:5173');

/** Never bounce a LAN session to localhost when ALLOW_LAN is enabled. */
export function resolveDevRedirectOrigin(currentOrigin) {
  const isDev =
    typeof process !== 'undefined'
      ? process.env.NODE_ENV === 'development'
      : import.meta.env.DEV;
  if (!isDev || !ALLOW_LAN) return APP_ORIGIN;

  try {
    const host = new URL(currentOrigin).hostname;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return currentOrigin;
  } catch {
    /* ignore */
  }

  return APP_ORIGIN;
}

export function appUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (ALLOW_LAN && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${normalized}`;
  }
  return `${APP_ORIGIN}${normalized}`;
}

const DEV_HOSTNAMES = new Set(['localhost', '127.0.0.1', 'memome.local']);

function isDevLocalOrigin(origin) {
  try {
    const url = new URL(origin);
    if (url.port && url.port !== '5173') return false;
    return DEV_HOSTNAMES.has(url.hostname);
  } catch {
    return false;
  }
}

export function isAllowedDevOrigin(origin) {
  const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : import.meta.env.DEV;
  if (!isDev) return origin === APP_ORIGIN;

  if (isDevLocalOrigin(origin)) return true;

  if (ALLOW_LAN) {
    try {
      const url = new URL(origin);
      if (url.port && url.port !== '5173') return false;
      return /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname);
    } catch {
      return false;
    }
  }

  return (
    origin === APP_ORIGIN
    || origin === 'http://localhost:5173'
    || origin === 'https://localhost:5173'
  );
}
