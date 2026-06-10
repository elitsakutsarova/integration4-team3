/**
 * Deterministic sticker pick from a location pool.
 * Same userKey + location always yields the same sticker (stable for localStorage → DB merge).
 * Skips stickers the user already owns until the full catalog is collected.
 */
export function pickStickerFromPool(userKey, locationId, pool, ownedStickerIds = []) {
  if (!pool?.length) return null;

  const owned = new Set(ownedStickerIds ?? []);
  let eligible = pool.filter(id => !owned.has(id));
  if (eligible.length === 0) eligible = [...pool];

  const hash = fnv1a(`${userKey}:${locationId}`);
  const index = hash % eligible.length;
  return eligible[index];
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
