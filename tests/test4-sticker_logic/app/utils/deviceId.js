const DEVICE_KEY = 'memome_device_id';

/** Stable anonymous id for guest sticker claims (stored locally). */
export function getDeviceId() {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
