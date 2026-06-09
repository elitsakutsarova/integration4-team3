/**
 * Deterministic sticker pick from a location pool.
 * Same userKey + location always yields the same sticker (stable for localStorage → DB merge).
 * Different users/locations get different picks across the pool.
 */
export function pickStickerFromPool(userKey, locationId, pool) {
  if (!pool?.length) return null;
  const hash = fnv1a(`${userKey}:${locationId}`);
  const index = hash % pool.length;
  return pool[index];
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
