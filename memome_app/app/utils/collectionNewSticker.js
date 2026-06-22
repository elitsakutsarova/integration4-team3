/** Tracks which collectible should show the "new" badge after a QR scan. */

const LAST_NEW_KEY = 'memome_last_new_sticker_id';

export function writeLastNewStickerId(stickerId) {
  if (typeof sessionStorage === 'undefined' || !stickerId) return;
  sessionStorage.setItem(LAST_NEW_KEY, stickerId);
}

export function readLastNewStickerId() {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(LAST_NEW_KEY);
}
