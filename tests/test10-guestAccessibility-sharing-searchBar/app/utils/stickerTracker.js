/**
 * Persists sticker positions per diary page as percentages (0–100).
 * Used for rendering and for generating share assets at the same layout.
 */

const STORAGE_KEY = 'memome_sticker_layouts';

const listeners = new Set();

function notifyLayoutChange(diaryId, pageIndex) {
  for (const fn of listeners) {
    fn(diaryId, pageIndex);
  }
}

/** Subscribe to layout saves (e.g. share preview refresh). */
export function subscribeStickerLayouts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
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

export function savePageStickers(diaryId, pageIndex, stickers) {
  const all = readAll();
  if (!all[diaryId]) all[diaryId] = {};
  all[diaryId][String(pageIndex)] = stickers;
  writeAll(all);
  notifyLayoutChange(diaryId, pageIndex);
}

/** Persist a single sticker move without replacing the whole page list. */
export function updateStickerPosition(diaryId, pageIndex, uid, x, y) {
  const page = loadPageStickers(diaryId, pageIndex);
  const next = page.map(s =>
    s.uid === uid ? { ...s, x: clampPercent(x), y: clampPercent(y) } : s,
  );
  savePageStickers(diaryId, pageIndex, next);
  return next;
}

/** Write in-memory layout to storage (e.g. before opening share). */
export function syncDiaryLayoutToStorage(diaryId, pageStickersByPage) {
  if (!pageStickersByPage || typeof pageStickersByPage !== 'object') return;
  for (const [pageIndex, stickers] of Object.entries(pageStickersByPage)) {
    if (Array.isArray(stickers)) {
      savePageStickers(diaryId, Number(pageIndex), stickers);
    }
  }
}

export function getStickersForPage(diaryId, pageIndex, pageLayout) {
  const fromLayout = pageLayout?.[pageIndex] ?? pageLayout?.[String(pageIndex)];
  if (Array.isArray(fromLayout)) return fromLayout;
  return loadPageStickers(diaryId, pageIndex);
}

export function loadPageStickers(diaryId, pageIndex) {
  const all = readAll();
  const pages = all[diaryId];
  if (!pages) return [];
  return pages[pageIndex] ?? pages[String(pageIndex)] ?? [];
}

export function createSticker(stickerDef, x, y) {
  return {
    uid: `${stickerDef.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stickerId: stickerDef.id,
    emoji: stickerDef.emoji ?? null,
    src: stickerDef.src ?? null,
    x: clampPercent(x),
    y: clampPercent(y),
  };
}

export function clampPercent(v) {
  return Math.max(4, Math.min(96, v));
}

export function pixelToPercent(clientX, clientY, rect) {
  return {
    x: clampPercent(((clientX - rect.left) / rect.width) * 100),
    y: clampPercent(((clientY - rect.top) / rect.height) * 100),
  };
}

