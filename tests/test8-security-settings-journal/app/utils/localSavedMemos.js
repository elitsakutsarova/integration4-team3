import { makeLocalUserBucket } from './localStorageUserBucket';

/** @typedef {{ id: string, savedAt: string }} SavedMemoEntry */

const { getItems, setItems, clear } = makeLocalUserBucket('memome_saved_memos');

/** @returns {SavedMemoEntry[]} */
export function getLocalSavedMemos(userId) {
  return getItems(userId);
}

/** @returns {{ added: boolean, memos: SavedMemoEntry[] }} */
export function addLocalSavedMemo(userId, id) {
  const current = getItems(userId);
  const memoId = String(id);

  if (current.some(item => item.id === memoId)) {
    return { added: false, memos: current };
  }

  const next = [...current, { id: memoId, savedAt: new Date().toISOString() }];
  setItems(userId, next);
  return { added: true, memos: next };
}

/** @returns {SavedMemoEntry[]} */
export function removeLocalSavedMemo(userId, id) {
  const memoId = String(id);
  const next = getItems(userId).filter(item => item.id !== memoId);
  setItems(userId, next);
  return next;
}

export function clearLocalSavedMemos(userId) {
  clear(userId);
}

export function clearGuestSavedMemos() {
  clearLocalSavedMemos(null);
}
