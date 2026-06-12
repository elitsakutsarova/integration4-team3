import { href } from 'react-router';
import { isPhotonPlaceId, parsePhotonPlaceId } from './placeId';

export function buildLocationDetailHref({ placeId, lat, lng, name }) {
  if (!isPhotonPlaceId(placeId)) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const parsed = parsePhotonPlaceId(placeId);
  if (!parsed) return null;

  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (name?.trim()) params.set('name', name.trim());

  return `${href('/location/:osmType/:osmId', parsed)}?${params.toString()}`;
}

export function navigateToLocationDetail(navigate, locationHref, returnTo) {
  if (!locationHref) return;
  navigate(locationHref, {
    state: {
      returnTo: typeof returnTo === 'string' && returnTo.length > 0 ? returnTo : '/',
    },
  });
}
