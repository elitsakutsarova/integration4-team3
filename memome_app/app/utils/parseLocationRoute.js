import { redirect } from 'react-router';
import { buildPhotonPlaceId } from './placeId';
import { isInAntwerpBounds } from './locationHelpers';
import { fallbackPathFromRequest, isValidOsmRouteParams } from './appPaths';
import { validateUrlDisplayName } from './validators';

/** Shared param/query parsing for discover location detail routes. */
export function parseLocationRoute({ params, request }) {
  if (!isValidOsmRouteParams(params.osmType, params.osmId)) {
    throw redirect(fallbackPathFromRequest(request));
  }

  const url = new URL(request.url);
  const latRaw = url.searchParams.get('spotLat') ?? url.searchParams.get('lat');
  const lngRaw = url.searchParams.get('spotLng') ?? url.searchParams.get('lng');
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  const locationName = validateUrlDisplayName(url.searchParams.get('name') ?? '');
  const spotTitle = validateUrlDisplayName(url.searchParams.get('title') ?? '') || locationName;
  const osmType = String(params.osmType).toUpperCase();
  const placeId = buildPhotonPlaceId(osmType, params.osmId);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw redirect(fallbackPathFromRequest(request));
  }

  if (!isInAntwerpBounds(lat, lng)) {
    throw redirect(fallbackPathFromRequest(request));
  }

  return { placeId, lat, lng, locationName, spotTitle };
}
