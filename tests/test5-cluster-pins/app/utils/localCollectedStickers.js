const STORAGE_KEY = 'memome_collected_stickers';

/** @typedef {{ digitalStickerId: string, claimedAt: string }} LocalCollectedEntry */

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** @returns {LocalCollectedEntry[]} */
export function getLocalCollected() {
  return readAll();
}

export function getLocalOwnedStickerIds() {
  return [...new Set(readAll().map(entry => entry.digitalStickerId))];
}

/** @returns {LocalCollectedEntry | null} */
export function addLocalCollected(digitalStickerId) {
  const entries = readAll();
  if (entries.some(entry => entry.digitalStickerId === digitalStickerId)) {
    return entries.find(entry => entry.digitalStickerId === digitalStickerId) ?? null;
  }

  const entry = {
    digitalStickerId,
    claimedAt: new Date().toISOString(),
  };
  entries.push(entry);
  writeAll(entries);
  return entry;
}

export function clearLocalCollected() {
  localStorage.removeItem(STORAGE_KEY);
}
