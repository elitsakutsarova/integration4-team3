const PENDING_KEY = 'memome_pending_sticker_claims';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

/** @typedef {{ locationId: string, digitalStickerId: string, claimedAt: string }} PendingClaim */

/** @returns {PendingClaim[]} */
export function getPendingClaims() {
  return readAll();
}

export function hasPendingLocation(locationId) {
  return readAll().some(c => c.locationId === locationId);
}

/** @returns {PendingClaim | null} */
export function addPendingClaim(claim) {
  const list = readAll();
  if (list.some(c => c.locationId === claim.locationId)) {
    return list.find(c => c.locationId === claim.locationId) ?? null;
  }
  list.push(claim);
  writeAll(list);
  return claim;
}

export function removePendingLocation(locationId) {
  writeAll(readAll().filter(c => c.locationId !== locationId));
}

export function clearPendingClaims() {
  localStorage.removeItem(PENDING_KEY);
}

/** Unique digital sticker ids from pending queue */
export function getPendingStickerIds() {
  return [...new Set(readAll().map(c => c.digitalStickerId))];
}
