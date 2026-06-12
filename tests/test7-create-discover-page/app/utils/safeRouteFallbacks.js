/** Safe redirect targets when URLs are invalid or tampered with. */

import { TRAVEL_DIARY } from '../data/mockUser';

export const FALLBACK_HOME = '/';
export const FALLBACK_DISCOVER = '/discover';
export const FALLBACK_PROFILE = '/profile';
export const FALLBACK_DIARY = `/diary/${TRAVEL_DIARY.id}`;

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
