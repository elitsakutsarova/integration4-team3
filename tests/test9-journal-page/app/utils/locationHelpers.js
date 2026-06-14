/** Shared helpers for memo location picking. */

export const ANTWERP_BOUNDS = {
  south: 51.05,
  north: 51.40,
  west: 4.15,
  east: 4.65,
};

export const ANTWERP_BOUNDS_LEAFLET = [
  [ANTWERP_BOUNDS.south, ANTWERP_BOUNDS.west],
  [ANTWERP_BOUNDS.north, ANTWERP_BOUNDS.east],
];

export function isInAntwerpBounds(lat, lng) {
  return (
    lat >= ANTWERP_BOUNDS.south
    && lat <= ANTWERP_BOUNDS.north
    && lng >= ANTWERP_BOUNDS.west
    && lng <= ANTWERP_BOUNDS.east
  );
}

export function formatCustomLocationName(lat, lng) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function createCustomPlace(lat, lng) {
  return {
    id: `custom/${lat.toFixed(5)},${lng.toFixed(5)}`,
    name: formatCustomLocationName(lat, lng),
    lat,
    lng,
    category: 'custom',
    custom: true,
  };
}

export function filterPlaces(places, query, limit = 15) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return places
    .filter(place => place.name.toLowerCase().includes(q))
    .slice(0, limit);
}

export function placesForMapPins(places, query, limit = 30) {
  return filterPlaces(places, query, limit);
}

const COORD_LABEL_RE = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;

/** True for map pins / "My spot" — not a searchable venue name. */
export function isCustomLocationLabel(location) {
  const label = String(location ?? '').trim();
  if (!label || label === 'My spot') return true;
  return COORD_LABEL_RE.test(label);
}

export function isNamedVenueLocation(location) {
  return !isCustomLocationLabel(location);
}

