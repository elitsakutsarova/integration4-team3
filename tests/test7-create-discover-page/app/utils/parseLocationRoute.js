import { redirect } from 'react-router';
import { buildPhotonPlaceId } from './placeId';
import { fallbackPathFromRequest, isValidOsmRouteParams } from './safeRouteFallbacks';

/** Shared param/query parsing for /location/:osmType/:osmId routes. */
export function parseLocationRoute({ params, request }) {
  if (!isValidOsmRouteParams(params.osmType, params.osmId)) {
    throw redirect(fallbackPathFromRequest(request));
  }

  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const locationName = url.searchParams.get('name') ?? '';
  const spotTitle = url.searchParams.get('title') ?? locationName;
  const osmType = String(params.osmType).toUpperCase();
  const placeId = buildPhotonPlaceId(osmType, params.osmId);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw redirect(fallbackPathFromRequest(request));
  }

  return { placeId, lat, lng, locationName, spotTitle };
}
