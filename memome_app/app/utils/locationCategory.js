const FOOD_VALUES = new Set([
  'restaurant', 'cafe', 'fast_food', 'food_court', 'biergarten', 'ice_cream', 'bakery',
]);

const NIGHTLIFE_VALUES = new Set([
  'bar', 'pub', 'nightclub', 'night_club', 'biergarten',
]);

const FASHION_VALUES = new Set(['clothes', 'fashion', 'boutique', 'jewelry', 'shoes']);

const ART_VALUES = new Set(['museum', 'gallery', 'arts_centre', 'theatre', 'cinema']);

const MUSIC_VALUES = new Set([
  'music', 'concert_hall', 'nightclub', 'night_club', 'dance', 'events_venue',
]);

const NATURE_VALUES = new Set([
  'park', 'garden', 'nature_reserve', 'forest', 'beach', 'viewpoint',
]);

const CANONICAL_LABELS = new Set([
  'Food', 'Nightlife', 'Fashion', 'Art & Culture', 'Music', 'Nature', 'Place',
]);

function normalizeOsmValue(value) {
  if (!value) return '';
  return String(value).trim().toLowerCase().replace(/\s+/g, '_');
}

function inferFromFreeText(label) {
  const text = String(label).trim().toLowerCase();
  if (!text) return null;

  const tokens = text.replace(/[_-]/g, ' ').split(/\s+/);

  for (const token of tokens) {
    if (FOOD_VALUES.has(token)) return 'Food';
    if (NIGHTLIFE_VALUES.has(token)) return 'Nightlife';
    if (FASHION_VALUES.has(token)) return 'Fashion';
    if (ART_VALUES.has(token)) return 'Art & Culture';
    if (MUSIC_VALUES.has(token)) return 'Music';
    if (NATURE_VALUES.has(token)) return 'Nature';
  }

  if (/\b(restaurant|cafe|café|bakery|bistro|brasserie|food)\b/.test(text)) return 'Food';
  if (/\b(bar|pub|nightclub|night club|cocktail|brewery|biergarten)\b/.test(text)) return 'Nightlife';
  if (/\b(museum|gallery|theatre|theater|cinema|culture)\b/.test(text)) return 'Art & Culture';
  if (/\b(park|garden|nature|forest|beach)\b/.test(text)) return 'Nature';
  if (/\b(fashion|clothes|boutique|jewelry|shoes)\b/.test(text)) return 'Fashion';
  if (/\b(music|concert|venue)\b/.test(text)) return 'Music';

  return null;
}

/** Map OSM tags or display labels to a discover category used for badges and placeholders. */
export function resolveLocationCategoryLabel(osmKey, osmValue, fallbackLabel) {
  const value = normalizeOsmValue(osmValue);

  if (FOOD_VALUES.has(value)) return 'Food';
  if (NIGHTLIFE_VALUES.has(value)) return 'Nightlife';
  if (FASHION_VALUES.has(value)) return 'Fashion';
  if (ART_VALUES.has(value)) return 'Art & Culture';
  if (MUSIC_VALUES.has(value)) return 'Music';
  if (NATURE_VALUES.has(value)) return 'Nature';

  if (fallbackLabel && CANONICAL_LABELS.has(fallbackLabel)) {
    return fallbackLabel;
  }

  const inferred = inferFromFreeText(fallbackLabel);
  if (inferred) return inferred;

  if (osmKey === 'amenity' && value) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  return 'Place';
}

export { FOOD_VALUES, NIGHTLIFE_VALUES, FASHION_VALUES, ART_VALUES };
