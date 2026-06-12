import { clearLocalUserBucket } from './localStorageUserBucket';

const STORAGE_KEY = 'memome_discover_faves';

/** @typedef {'event' | 'place'} DiscoverFaveType */
/** @typedef {{ type: DiscoverFaveType, id: string, savedAt: string }} DiscoverFaveEntry */

function storageKey(userId) {
  return userId ?? 'guest';
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** @returns {DiscoverFaveEntry[]} */
export function getLocalDiscoverFaves(userId) {
  const bucket = readAll()[storageKey(userId)];
  return Array.isArray(bucket) ? bucket : [];
}

/** @returns {{ added: boolean, faves: DiscoverFaveEntry[] }} */
export function addLocalDiscoverFave(userId, entry) {
  const key = storageKey(userId);
  const all = readAll();
  const current = Array.isArray(all[key]) ? all[key] : [];
  const exists = current.some(item => item.type === entry.type && item.id === entry.id);

  if (exists) {
    return { added: false, faves: current };
  }

  const next = [...current, entry];
  all[key] = next;
  writeAll(all);
  return { added: true, faves: next };
}

/** @returns {DiscoverFaveEntry[]} */
export function removeLocalDiscoverFave(userId, type, id) {
  const key = storageKey(userId);
  const all = readAll();
  const current = Array.isArray(all[key]) ? all[key] : [];
  const next = current.filter(item => !(item.type === type && item.id === id));
  all[key] = next;
  writeAll(all);
  return next;
}

export function isLocalDiscoverFaved(userId, type, id) {
  return getLocalDiscoverFaves(userId).some(item => item.type === type && item.id === id);
}

export function clearLocalDiscoverFaves(userId) {
  clearLocalUserBucket(STORAGE_KEY, userId);
}

export function clearGuestDiscoverFaves() {
  clearLocalDiscoverFaves(null);
}
