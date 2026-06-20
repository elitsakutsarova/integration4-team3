/**
 * Server-side Photon location href resolution.
 * Do not import from client components — use locationHrefClient.js instead.
 */

import { isNamedVenueLocation } from './locationHelpers';
import { buildLocationDetailHref } from './locationHref';
import { fetchPhotonPlaceDetail, resolvePhotonPoiAt } from './locationPhoton';
import { searchAntwerpPlaces } from './locationSearch.server';
import { isPhotonPlaceId } from './placeId';

const hrefCache = new Map();

function cacheKey({ placeId, lat, lng, name }) {
  if (placeId) return `id:${placeId}`;
  return `coord:${lat},${lng}|${String(name ?? '').trim().toLowerCase()}`;
}

async function resolvePhotonPlaceHref(placeId, lat, lng, name) {
  let detail = await fetchPhotonPlaceDetail({ lat, lng, placeId, name });
  if (!detail || detail.id !== placeId) {
    if (name) {
      const { places } = await searchAntwerpPlaces(name);
      const match = places.find(place => place.id === placeId);
      if (match) {
        detail = {
          id: match.id,
          lat: match.lat,
          lng: match.lng,
          name: match.name ?? name,
        };
      }
    }
  }
  if (!detail || detail.id !== placeId) return null;

  return buildLocationDetailHref({
    placeId: detail.id,
    lat: detail.lat,
    lng: detail.lng,
    name: detail.name ?? name,
  });
}

export async function resolveNavigableLocationHrefs(pins) {
  const pairs = await Promise.all(
    pins
      .filter(pin => Array.isArray(pin.ll) && pin.ll.every(Number.isFinite))
      .map(async pin => {
        const href = await resolveNavigableLocationHref({
          placeId: pin.placeId,
          lat: pin.ll[0],
          lng: pin.ll[1],
          name: pin.label ?? pin.location ?? pin.name,
        });
        return [pin.id, href];
      }),
  );
  return new Map(pairs.filter(([, href]) => href != null));
}

export async function resolveNavigableLocationHref({ placeId, lat, lng, name }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const key = cacheKey({ placeId, lat, lng, name });
  if (hrefCache.has(key)) return hrefCache.get(key);

  const pending = (async () => {
    if (isPhotonPlaceId(placeId)) {
      return resolvePhotonPlaceHref(placeId, lat, lng, name);
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
