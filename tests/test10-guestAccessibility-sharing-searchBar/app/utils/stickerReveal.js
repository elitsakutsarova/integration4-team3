/** Session-scoped sticker reveal shown on the map after a guest QR scan. */

const KEY = 'memome_sticker_reveal';

export function writeStickerReveal(sticker) {
  if (typeof sessionStorage === 'undefined' || !sticker?.id) return;
  sessionStorage.setItem(KEY, JSON.stringify(sticker));
}

export function readStickerReveal() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStickerReveal() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
