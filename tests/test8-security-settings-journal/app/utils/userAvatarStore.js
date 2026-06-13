const STORAGE_KEY = 'memome_avatars';
const AVATAR_CHANGE_EVENT = 'memome:avatar-changed';
const AVATAR_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;

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

function userKey(userId) {
  return userId ?? 'guest';
}

function notifyAvatarChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT));
}

export function subscribeUserAvatar(onStoreChange) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(AVATAR_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(AVATAR_CHANGE_EVENT, onStoreChange);
}

export function getUserAvatar(userId) {
  if (typeof window === 'undefined') return null;

  const avatar = readAll()[userKey(userId)];
  return typeof avatar === 'string' && avatar.startsWith('data:image/') ? avatar : null;
}

export function setUserAvatar(userId, dataUrl) {
  const all = readAll();
  all[userKey(userId)] = dataUrl;
  writeAll(all);
  notifyAvatarChange();
  return dataUrl;
}

export function clearUserAvatar(userId) {
  const key = userKey(userId);
  const all = readAll();
  if (!(key in all)) return;
  delete all[key];
  writeAll(all);
  notifyAvatarChange();
}

export function validateAvatarFile(file) {
  if (!file) return { field: 'form', message: 'Choose an image to upload.' };
  if (!AVATAR_IMAGE_TYPES.has(file.type)) {
    return { field: 'form', message: 'Use a JPG, PNG, WebP, or GIF image.' };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { field: 'form', message: 'Image must be under 1.5 MB.' };
  }
  return { ok: true };
}

export async function readAvatarDataUrl(file) {
  const validation = validateAvatarFile(file);
  if (validation.field) return { error: validation };

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result?.startsWith('data:image/')) {
        resolve({ error: { field: 'form', message: 'Could not read that image.' } });
        return;
      }
      resolve({ dataUrl: result });
    };
    reader.onerror = () => {
      resolve({ error: { field: 'form', message: 'Could not read that image.' } });
    };
    reader.readAsDataURL(file);
  });
}
