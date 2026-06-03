/**
 * Persists sticker positions per diary page as percentages (0–100).
 * Used for rendering and for generating share assets at the same layout.
 */

const STORAGE_KEY = 'memome_sticker_layouts';

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

export function loadPageStickers(diaryId, pageIndex) {
  const all = readAll();
  return all[diaryId]?.[pageIndex] ?? [];
}

export function savePageStickers(diaryId, pageIndex, stickers) {
  const all = readAll();
  if (!all[diaryId]) all[diaryId] = {};
  all[diaryId][pageIndex] = stickers;
  writeAll(all);
}

export function getDiaryStickerLayout(diaryId) {
  const all = readAll();
  return all[diaryId] ?? {};
}

/** Export layout for sharing — normalised coords per page */
export function exportShareLayout(diaryId, pageIndices) {
  const layout = getDiaryStickerLayout(diaryId);
  const exported = {};
  for (const idx of pageIndices) {
    exported[idx] = (layout[idx] ?? []).map(s => ({
      uid: s.uid,
      stickerId: s.stickerId,
      emoji: s.emoji,
      x: s.x,
      y: s.y,
    }));
  }
  return exported;
}

export function createSticker(stickerDef, x, y) {
  return {
    uid: `${stickerDef.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stickerId: stickerDef.id,
    emoji: stickerDef.emoji,
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

export function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}
