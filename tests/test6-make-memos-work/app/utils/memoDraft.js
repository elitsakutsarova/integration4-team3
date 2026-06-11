/** Read memo draft pin state from URL search params. */

export function readDraftMemo(searchParams) {
  const latRaw = searchParams.get('lat');
  const lngRaw = searchParams.get('lng');
  if (latRaw == null || lngRaw == null || latRaw === '' || lngRaw === '') return null;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const pinLatRaw = searchParams.get('pinLat') ?? latRaw;
  const pinLngRaw = searchParams.get('pinLng') ?? lngRaw;
  const pinLat = Number(pinLatRaw);
  const pinLng = Number(pinLngRaw);

  const locationName = searchParams.get('locationName') ?? '';
  const placeId = searchParams.get('placeId') ?? '';
  const pickLocation = searchParams.get('step') === 'location';

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
