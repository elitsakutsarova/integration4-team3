const STORAGE_KEY = 'memome_saved_memos';

/** @typedef {{ id: string, savedAt: string }} SavedMemoEntry */

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

/** @returns {SavedMemoEntry[]} */
export function getLocalSavedMemos(userId) {
  const bucket = readAll()[storageKey(userId)];
  return Array.isArray(bucket) ? bucket : [];
}

/** @returns {{ added: boolean, memos: SavedMemoEntry[] }} */
export function addLocalSavedMemo(userId, id) {
  const key = storageKey(userId);
  const all = readAll();
  const current = Array.isArray(all[key]) ? all[key] : [];
  const memoId = String(id);
  const exists = current.some(item => item.id === memoId);

  if (exists) {
    return { added: false, memos: current };
  }

  const next = [...current, { id: memoId, savedAt: new Date().toISOString() }];
  all[key] = next;
  writeAll(all);
  return { added: true, memos: next };
}

/** @returns {SavedMemoEntry[]} */
export function removeLocalSavedMemo(userId, id) {
  const key = storageKey(userId);
  const all = readAll();
  const current = Array.isArray(all[key]) ? all[key] : [];
  const memoId = String(id);
  const next = current.filter(item => item.id !== memoId);
  all[key] = next;
  writeAll(all);
  return next;
}

export function isLocalSavedMemo(userId, id) {
  return getLocalSavedMemos(userId).some(item => item.id === String(id));
}
