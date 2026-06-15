/**
 * Resolve whether a map pin / venue can link to a verified Photon location page.
 * Results are cached so repeated checks during navigation stay instant.
 */

import { isNamedVenueLocation } from './locationHelpers';
import { buildLocationDetailHref } from './locationHref';
import { fetchPhotonPlaceDetail, resolvePhotonPoiAt } from './locationPhoton';
import { isPhotonPlaceId } from './placeId';

const hrefCache = new Map();

function cacheKey({ placeId, lat, lng, name }) {
  if (placeId) return `id:${placeId}`;
  return `coord:${lat},${lng}|${String(name ?? '').trim().toLowerCase()}`;
}

export async function resolveNavigableLocationHref({ placeId, lat, lng, name }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const key = cacheKey({ placeId, lat, lng, name });
  if (hrefCache.has(key)) return hrefCache.get(key);

  const pending = (async () => {
    if (isPhotonPlaceId(placeId)) {
      const detail = await fetchPhotonPlaceDetail({ lat, lng, placeId });
      if (!detail || detail.id !== placeId) return null;

      return buildLocationDetailHref({
        placeId: detail.id,
        lat: detail.lat,
        lng: detail.lng,
        name: detail.name,
      });
    }

    if (!isNamedVenueLocation(name)) return null;

    const resolved = await resolvePhotonPoiAt({ lat, lng, name });
    if (!resolved?.id) return null;

    return buildLocationDetailHref({
      placeId: resolved.id,
      lat: resolved.lat,
      lng: resolved.lng,
      name: resolved.name ?? name,
    });
  })();

  hrefCache.set(key, pending);

  try {
    const href = await pending;
    hrefCache.set(key, href);
    return href;
  } catch {
    hrefCache.set(key, null);
    return null;
  }
}
