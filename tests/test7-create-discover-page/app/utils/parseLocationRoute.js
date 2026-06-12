import { data } from 'react-router';
import { buildPhotonPlaceId } from './placeId';

/** Shared param/query parsing for /location/:osmType/:osmId routes. */
export function parseLocationRoute({ params, request }) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const locationName = url.searchParams.get('name') ?? '';
  const spotTitle = url.searchParams.get('title') ?? locationName;
  const placeId = buildPhotonPlaceId(params.osmType, params.osmId);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw data('Missing map coordinates for this place.', { status: 400 });
  }

  return { placeId, lat, lng, locationName, spotTitle };
}
