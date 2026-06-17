/** Type-safe internal paths via React Router href(). */

import { href } from 'react-router';
import { TRAVEL_DIARY } from '../data/mockUser';

export const paths = {
  home: href('/'),
  search: href('/search'),
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
  journals: href('/journals'),
  journalsCreate: href('/journals/create'),
  journalsCreateMemos: href('/journals/create/memos'),
  journalsEdit: journalsEditPath,
  journalsEditMemos: journalsEditMemosPath,
  stickers: href('/stickers'),
  connect: href('/connect'),
  collect: href('/collect'),
  demoStickers: href('/demo-stickers'),
  apiMemos: href('/api/memos'),
  apiAccount: href('/api/account'),
  apiFeedback: href('/api/feedback'),
  apiLocationSearch: href('/api/location-search'),
  apiLocationHref: href('/api/location-href'),
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

export function journalsEditPath(id) {
  return href('/journals/:id/edit', { id });
}

export function journalsEditMemosPath(id) {
  return href('/journals/:id/edit/memos', { id });
}

export function collectScanPath(scanKey) {
  return `${paths.collect}?scan=${encodeURIComponent(String(scanKey))}`;
}

const ANTWERP_MAP_CENTER = { lat: 51.2194, lng: 4.4025 };

/** Home map URL that opens the new-memo form at the default Antwerp center. */
export function homePathWithAddMemo(
  lat = ANTWERP_MAP_CENTER.lat,
  lng = ANTWERP_MAP_CENTER.lng,
) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    pinLat: String(lat),
    pinLng: String(lng),
  });
  return `${paths.home}?${params.toString()}`;
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

/** Guest-accessible routes (QR collect flow must work without logging in). */
const PUBLIC_APP_PATHS = new Set([paths.login, paths.register, paths.collect]);

const GUEST_APP_PATHS = new Set([
  paths.home,
  paths.search,
  paths.collect,
  paths.profile,
  paths.stickers,
  paths.discover,
  paths.journals,
]);

export function isPublicAppPath(pathname) {
  return PUBLIC_APP_PATHS.has(pathname);
}

export function isGuestAccessiblePath(pathname) {
  if (GUEST_APP_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/discover')) return true;
  if (pathname.startsWith('/location')) return true;
  return false;
}

export const FALLBACK_HOME = paths.home;
export const FALLBACK_DISCOVER = paths.discover;
export const FALLBACK_PROFILE = paths.profile;
export const FALLBACK_JOURNALS = paths.journals;
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
    return FALLBACK_JOURNALS;
  }
  if (path.startsWith('/journals')) {
    return FALLBACK_JOURNALS;
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
