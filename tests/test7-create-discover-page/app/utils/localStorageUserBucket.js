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
