// utility function to build the location detail href

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

export function navigateToLocationDetail(navigate, locationHref) {
  if (!locationHref) return;
  navigate(locationHref);
}

export function buildMemoArchiveHref({ placeId, lat, lng, name, title }) {
  if (!isPhotonPlaceId(placeId)) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const parsed = parsePhotonPlaceId(placeId);
  if (!parsed) return null;

  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (name?.trim()) params.set('name', name.trim());
  if (title?.trim()) params.set('title', title.trim());

  return `${href('/location/:osmType/:osmId/memos', parsed)}?${params.toString()}`;
}
