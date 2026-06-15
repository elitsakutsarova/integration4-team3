/** Clears one user-scoped bucket from a `{ [userKey]: items[] }` localStorage object. */
export function clearLocalUserBucket(storageKey, userId) {
  const key = userId ?? 'guest';

  try {
    const all = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    if (!(key in all)) return;
    delete all[key];
    localStorage.setItem(storageKey, JSON.stringify(all));
  } catch {
    // ignore corrupt storage
  }
}

/**
 * Creates read/write helpers for a per-user `{ [userId]: T[] }` localStorage collection.
 * Callers implement their own domain-specific get/add/remove on top.
 */
export function makeLocalUserBucket(storageKey) {
  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    } catch {
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function userKey(userId) {
    return userId ?? 'guest';
  }

  function getItems(userId) {
    const bucket = readAll()[userKey(userId)];
    return Array.isArray(bucket) ? bucket : [];
  }

  function setItems(userId, items) {
    const all = readAll();
    all[userKey(userId)] = items;
    writeAll(all);
  }

  function clear(userId) {
    clearLocalUserBucket(storageKey, userId);
  }

  return { getItems, setItems, clear };
}
