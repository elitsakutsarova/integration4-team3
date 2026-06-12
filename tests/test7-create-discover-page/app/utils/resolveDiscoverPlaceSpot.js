import { isPhotonPlaceId } from './placeId';

const SEARCH_TIMEOUT_MS = 2500;

function hasValidSpot(place) {
  return isPhotonPlaceId(place.placeId)
    && Array.isArray(place.ll)
    && place.ll.length >= 2
    && Number.isFinite(place.ll[0])
    && Number.isFinite(place.ll[1]);
}

function pickBestSearchMatch(places, place) {
  const title = (place.title ?? '').trim().toLowerCase();
  if (!title) return places[0] ?? null;

  const exact = places.find(entry => entry.name?.trim().toLowerCase() === title);
  if (exact) return exact;

  const firstWord = title.split(/\s+/)[0];
  const partial = places.find(entry =>
    entry.name?.trim().toLowerCase().includes(firstWord),
  );
  return partial ?? places[0] ?? null;
}

/** Fill in missing placeId / coordinates via Photon search — never throws. */
export async function resolveDiscoverPlaceSpot(place) {
  if (hasValidSpot(place)) return place;

  const query = place.mapsQuery
    ?? [place.title, place.location, 'Antwerp'].filter(Boolean).join(', ');

  try {
    const response = await fetch(
      `/api/location-search?q=${encodeURIComponent(query)}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      },
    );
    if (!response.ok) return place;

    const payload = await response.json();
    const places = Array.isArray(payload?.places) ? payload.places : [];
    const match = pickBestSearchMatch(places, place);
    if (!match?.id || !Number.isFinite(match.lat) || !Number.isFinite(match.lng)) {
      return place;
    }

    return {
      ...place,
      placeId: match.id,
      ll: [match.lat, match.lng],
    };
  } catch {
    return place;
  }
}
