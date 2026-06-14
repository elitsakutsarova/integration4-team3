import { makeLocalUserBucket } from './localStorageUserBucket';

/** @typedef {'event' | 'place'} DiscoverFaveType */
/** @typedef {{ type: DiscoverFaveType, id: string, savedAt: string }} DiscoverFaveEntry */

const { getItems, setItems, clear } = makeLocalUserBucket('memome_discover_faves');

/** @returns {DiscoverFaveEntry[]} */
export function getLocalDiscoverFaves(userId) {
  return getItems(userId);
}

/** @returns {{ added: boolean, faves: DiscoverFaveEntry[] }} */
export function addLocalDiscoverFave(userId, entry) {
  const current = getItems(userId);

  if (current.some(item => item.type === entry.type && item.id === entry.id)) {
    return { added: false, faves: current };
  }

  const next = [...current, entry];
  setItems(userId, next);
  return { added: true, faves: next };
}

/** @returns {DiscoverFaveEntry[]} */
export function removeLocalDiscoverFave(userId, type, id) {
  const next = getItems(userId).filter(item => !(item.type === type && item.id === id));
  setItems(userId, next);
  return next;
}

export function clearLocalDiscoverFaves(userId) {
  clear(userId);
}

export function clearGuestDiscoverFaves() {
  clearLocalDiscoverFaves(null);
}
