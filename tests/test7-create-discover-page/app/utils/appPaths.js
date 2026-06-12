/** Type-safe internal paths via React Router href(). */

import { href } from 'react-router';

export const paths = {
  home: href('/'),
  discover: href('/discover'),
  discoverHappeningNow: href('/discover/happening-now'),
  discoverUpcoming: href('/discover/upcoming'),
  discoverPlaces: href('/discover/places'),
  login: href('/login'),
  register: href('/register'),
  profile: href('/profile'),
  stickers: href('/stickers'),
  connect: href('/connect'),
  collect: href('/collect'),
  demoStickers: href('/demo-stickers'),
};

export function discoverEventPath(id) {
  return href('/discover/event/:id', { id });
}

export function discoverPlacePath(id) {
  return href('/discover/place/:id', { id });
}

export function diaryPath(id) {
  return href('/diary/:id', { id });
}

export function collectScanPath(scanKey) {
  return `${paths.collect}?scan=${encodeURIComponent(String(scanKey))}`;
}

/** Allow same-origin relative paths only — blocks open redirects. */
export function safeInternalRedirectPath(candidate) {
  if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return null;
  }
  if (candidate.startsWith('/login') || candidate.startsWith('/register')) {
    return null;
  }
  return candidate;
}

export function loginPathWithRedirect(returnPath) {
  const safe = safeInternalRedirectPath(returnPath);
  if (!safe) return paths.login;
  return `${paths.login}?${new URLSearchParams({ redirectTo: safe }).toString()}`;
}
