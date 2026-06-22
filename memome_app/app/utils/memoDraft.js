/** Read memo draft pin state from URL search params. */

import { isInAntwerpBounds } from './locationHelpers';

export function hasChosenMemoLocation(draft) {
  if (!draft) return false;
  if (draft.lat == null || draft.lng == null || draft.lat === '' || draft.lng === '') return false;

  const lat = Number(draft.lat);
  const lng = Number(draft.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (!draft.locationName?.trim()) return false;

  return isInAntwerpBounds(lat, lng);
}

export function readDraftMemo(searchParams) {
  const pickLocation = searchParams.get('step') === 'location';
  const placeId = searchParams.get('placeId') ?? '';
  const latRaw = searchParams.get('lat');
  const lngRaw = searchParams.get('lng');
  const hasCoordinates = latRaw != null && lngRaw != null && latRaw !== '' && lngRaw !== '';

  if (searchParams.get('addMemo') === '1' && !hasCoordinates) {
    return {
      lat: null,
      lng: null,
      pinLat: null,
      pinLng: null,
      locationName: searchParams.get('locationName') ?? '',
      placeId,
      pickLocation,
    };
  }

  if (!hasCoordinates) return null;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const pinLatRaw = searchParams.get('pinLat') ?? latRaw;
  const pinLngRaw = searchParams.get('pinLng') ?? lngRaw;
  const pinLat = Number(pinLatRaw);
  const pinLng = Number(pinLngRaw);

  const locationName = searchParams.get('locationName') ?? '';

  return {
    lat,
    lng,
    pinLat: Number.isFinite(pinLat) ? pinLat : lat,
    pinLng: Number.isFinite(pinLng) ? pinLng : lng,
    locationName,
    placeId,
    pickLocation,
  };
}
