/** Type-safe internal paths via React Router href(). */

import { href } from 'react-router';
import { TRAVEL_DIARY } from '../data/mockUser';

export const paths = {
  home: href('/'),
  discover: href('/discover'),
  discoverHappeningNow: href('/discover/happening-now'),
  discoverUpcoming: href('/discover/upcoming'),
  discoverPlaces: href('/discover/places'),
  login: href('/login'),
  register: href('/register'),
  profile: href('/profile'),
  profileSettings: href('/profile/settings'),
  profileSettingsAccount: href('/profile/settings/account'),
  profileSettingsChangePassword: href('/profile/settings/change-password'),
  profileSettingsChangeEmail: href('/profile/settings/change-email'),
  profileSettingsLanguage: href('/profile/settings/language'),
  profileSettingsPrivacy: href('/profile/settings/privacy'),
  profileSettingsFeedback: href('/profile/settings/feedback'),
  profileMemos: href('/profile/memos'),
  profileFavourites: href('/profile/favourites'),
  profileFavouritesMemos: href('/profile/favourites/memos'),
  profileFavouritesSpots: href('/profile/favourites/spots'),
  profileFavouritesEvents: href('/profile/favourites/events'),
  stickers: href('/stickers'),
  connect: href('/connect'),
  collect: href('/collect'),
  demoStickers: href('/demo-stickers'),
  apiMemos: href('/api/memos'),
  apiAccount: href('/api/account'),
  apiFeedback: href('/api/feedback'),
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

const PUBLIC_APP_PATHS = new Set([paths.login, paths.register]);

export function isPublicAppPath(pathname) {
  return PUBLIC_APP_PATHS.has(pathname);
}

export const FALLBACK_HOME = paths.home;
export const FALLBACK_DISCOVER = paths.discover;
export const FALLBACK_PROFILE = paths.profile;
export const FALLBACK_DIARY = diaryPath(TRAVEL_DIARY.id);

const VALID_OSM_TYPES = new Set(['N', 'W', 'R']);

/** Map an invalid pathname to the closest sensible default page. */
export function getSafeFallbackPath(pathname) {
  const path = pathname.toLowerCase();

  if (path.startsWith('/discover/event/') || path.startsWith('/discover/place/')) {
    return FALLBACK_DISCOVER;
  }
  if (path.startsWith('/discover/')) {
    return FALLBACK_DISCOVER;
  }
  if (path.startsWith('/location/')) {
    return FALLBACK_HOME;
  }
  if (path.startsWith('/diary/')) {
    return FALLBACK_DIARY;
  }
  if (path.startsWith('/profile') || path.startsWith('/stickers') || path.startsWith('/collect') || path.startsWith('/connect')) {
    return FALLBACK_PROFILE;
  }
  if (path.startsWith('/login') || path.startsWith('/register')) {
    return FALLBACK_HOME;
  }

  return FALLBACK_HOME;
}

export function isValidOsmRouteParams(osmType, osmId) {
  const normalizedType = String(osmType ?? '').toUpperCase();
  return VALID_OSM_TYPES.has(normalizedType) && /^\d+$/.test(String(osmId ?? ''));
}

export function fallbackPathFromRequest(request) {
  return getSafeFallbackPath(new URL(request.url).pathname);
}

/** Pop browser history when possible; avoids navigate(returnTo) pushing duplicate entries. */
export function goBack(navigate, fallback = paths.home) {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}
