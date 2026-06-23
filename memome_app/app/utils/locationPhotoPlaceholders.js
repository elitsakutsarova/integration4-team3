import { resolveLocationCategoryLabel } from './locationCategory';

const PLACEHOLDER_BASE = '/location_photos_placeholders';

const CATEGORY_PLACEHOLDERS = {
  Food: `${PLACEHOLDER_BASE}/food.png`,
  Nightlife: `${PLACEHOLDER_BASE}/nightlife.png`,
  Fashion: `${PLACEHOLDER_BASE}/fashion.png`,
  'Art & Culture': `${PLACEHOLDER_BASE}/art_and_culture.png`,
  Music: `${PLACEHOLDER_BASE}/music.png`,
  Nature: `${PLACEHOLDER_BASE}/nature.png`,
  Random: `${PLACEHOLDER_BASE}/random.png`,
  Place: `${PLACEHOLDER_BASE}/random.png`,
};

export function getLocationPhotoPlaceholder(categoryLabel, osmKey, osmValue) {
  const resolved = resolveLocationCategoryLabel(osmKey, osmValue, categoryLabel);
  return CATEGORY_PLACEHOLDERS[resolved] ?? CATEGORY_PLACEHOLDERS.Place;
}

export function resolveLocationHeroImage(imageUrl, categoryLabel, osmKey, osmValue) {
  return imageUrl || getLocationPhotoPlaceholder(categoryLabel, osmKey, osmValue);
}
