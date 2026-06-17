// utility function that stores and retrieves achievement stickers progress from localStorage

const STORAGE_KEY = 'memome:achievement-progress';

const EMPTY_PROGRESS = {
  hasOpenedApp: false,
  hasScannedPhysicalSticker: false,
  hasSharedContent: false,
};

function readAll() {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAchievementProgress(userId) {
  const all = readAll();
  const guest = { ...EMPTY_PROGRESS, ...all.guest };

  if (!userId) return guest;

  const row = { ...EMPTY_PROGRESS, ...all[userId] };
  return {
    hasOpenedApp: row.hasOpenedApp || guest.hasOpenedApp,
    hasScannedPhysicalSticker: row.hasScannedPhysicalSticker || guest.hasScannedPhysicalSticker,
    hasSharedContent: row.hasSharedContent || guest.hasSharedContent,
  };
}

function patchProgress(userId, patch) {
  if (!userId) return { ...EMPTY_PROGRESS };
  const all = readAll();
  const next = { ...EMPTY_PROGRESS, ...all[userId], ...patch };
  all[userId] = next;
  writeAll(all);
  return next;
}

export function markAppOpened(userId) {
  if (!userId || getAchievementProgress(userId).hasOpenedApp) {
    return getAchievementProgress(userId);
  }
  return patchProgress(userId, { hasOpenedApp: true });
}

export function markPhysicalStickerScanned(userId) {
  if (!userId || getAchievementProgress(userId).hasScannedPhysicalSticker) {
    return getAchievementProgress(userId);
  }
  return patchProgress(userId, { hasScannedPhysicalSticker: true });
}

export function markContentShared(userId) {
  if (!userId || getAchievementProgress(userId).hasSharedContent) {
    return getAchievementProgress(userId);
  }
  return patchProgress(userId, { hasSharedContent: true });
}
