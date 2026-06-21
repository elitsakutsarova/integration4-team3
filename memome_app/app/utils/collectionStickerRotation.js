const ROTATION_MIN_DEG = -25;
const ROTATION_MAX_DEG = 25;

/** Spread unique tilts from -25deg to 25deg across a collection (one angle per sticker). */
export function assignUniqueCollectionRotations(stickers) {
  if (!stickers?.length) return [];

  const sorted = [...stickers].sort((a, b) =>
    String(a.id).localeCompare(String(b.id), undefined, { sensitivity: 'base' }),
  );

  const count = sorted.length;
  const span = ROTATION_MAX_DEG - ROTATION_MIN_DEG;
  const rotationById = new Map();

  sorted.forEach((sticker, index) => {
    const rotation = count <= 1
      ? 0
      : ROTATION_MIN_DEG + (index / (count - 1)) * span;
    rotationById.set(sticker.id, Number(rotation.toFixed(1)));
  });

  return stickers.map((sticker) => ({
    ...sticker,
    collectionRotation: rotationById.get(sticker.id) ?? 0,
  }));
}

export function resolveCollectionStickerRotation(sticker) {
  return typeof sticker?.collectionRotation === 'number' ? sticker.collectionRotation : 0;
}
