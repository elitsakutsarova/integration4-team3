/**
 * Renders memo/diary pages to PNG blobs for real sharing (Instagram, etc.)
 */

import {
  RECAP_ASSETS,
  RECAP_SLOTS,
  buildRecapSubtitle,
  formatRecapMemoDay,
  getRecapStyle,
  splitJournalTitle,
} from './recapTemplates';
import { getStickersForPage } from './stickerTracker';
import { getStickerDef } from './stickers';

const CARD_W = 1080;
const CARD_H = 1440;
const STORY_W = 1080;
const STORY_H = 1920;

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draw image into a box without stretching (object-fit: cover). */
function drawImageCover(ctx, img, x, y, w, h) {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  if (!sw || !sh) return;

  const destRatio = w / h;
  const srcRatio = sw / sh;

  let sx;
  let sy;
  let sWidth;
  let sHeight;

  if (srcRatio > destRatio) {
    sHeight = sh;
    sWidth = sh * destRatio;
    sx = (sw - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = sw;
    sHeight = sw / destRatio;
    sx = 0;
    sy = (sh - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

function resolveStickerSrc(sticker, stickerCatalog) {
  if (sticker.src) return sticker.src;
  const def = getStickerDef(sticker.stickerId, stickerCatalog);
  return def?.src ?? null;
}

async function drawStickers(ctx, stickers, photoX, photoY, photoW, photoH, stickerCatalog) {
  const size = Math.round(photoW * 0.24);

  for (const s of stickers) {
    const sx = photoX + (s.x / 100) * photoW;
    const sy = photoY + (s.y / 100) * photoH;
    const src = resolveStickerSrc(s, stickerCatalog);

    if (src) {
      try {
        const img = await loadImage(src.startsWith('/') ? `${window.location.origin}${src}` : src);
        ctx.drawImage(img, sx - size / 2, sy - size / 2, size, size);
      } catch {
        /* skip failed image */
      }
    } else if (s.emoji) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.round(photoW * 0.14);
      ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.fillText(s.emoji, sx, sy);
    }
  }
}

/** Render a single memo page card (polaroid style) */
export async function renderMemoCardImage(memory, stickers = [], stickerCatalog = []) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ececee';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Inner card
  const pad = 48;
  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, pad, pad, CARD_W - pad * 2, CARD_H - pad * 2, 24);
  ctx.fill();

  const innerX = pad + 40;
  const innerW = CARD_W - pad * 2 - 80;
  let y = pad + 72;

  // Date
  ctx.fillStyle = '#18181F';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(memory.date, CARD_W / 2, y);
  y += 56;

  // Polaroid photo area
  const photoW = innerW * 0.72;
  const photoH = photoW;
  const photoX = (CARD_W - photoW) / 2;
  const photoY = y;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(photoX - 16, photoY - 16, photoW + 32, photoH + 64);
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#d8d8dc';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  await drawStickers(ctx, stickers, photoX, photoY, photoW, photoH, stickerCatalog);

  const mediaSrc = memory.mediaPreview?.url;
  if (mediaSrc) {
    try {
      const url = mediaSrc.startsWith('/') ? `${window.location.origin}${mediaSrc}` : mediaSrc;
      const img = await loadImage(url);
      drawImageCover(ctx, img, photoX, photoY, photoW, photoH);
    } catch {
      /* keep placeholder */
    }
  }

  y = photoY + photoH + 100;

  // Quote
  ctx.fillStyle = '#18181F';
  ctx.font = 'bold 40px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  const quote = `"${memory.quote}"`;
  wrapText(ctx, quote, CARD_W / 2, y, innerW, 52);

  // Location
  ctx.fillStyle = '#6b6b78';
  ctx.font = '32px "Space Grotesk", sans-serif';
  ctx.fillText(`At: ${memory.location}`, CARD_W / 2, CARD_H - pad - 80);

  return canvasToFile(canvas, `memo-${memory.id}.png`);
}

/** Render trip recap collage */
export async function renderRecapImage(diary, memories, diaryId, pageOffset) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.strokeStyle = '#c5d4c0';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, CARD_W - 40, CARD_H - 40);

  ctx.fillStyle = '#18181F';
  ctx.font = 'bold 56px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(diary.title, CARD_W / 2, 120);

  const cols = 3;
  const cell = 280;
  const gap = 16;
  const gridW = cols * cell + (cols - 1) * gap;
  const startX = (CARD_W - gridW) / 2;
  let gy = 180;

  memories.slice(0, 9).forEach((m, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cell + gap);
    const y = gy + row * (cell + gap);

    ctx.fillStyle = '#d8d8dc';
    ctx.fillRect(x, y, cell, cell);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, cell, cell);

    ctx.fillStyle = '#18181F';
    ctx.font = 'italic 22px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.location.split(' ')[0].toLowerCase(), x + cell / 2, y + cell + 28);
  });

  return canvasToFile(canvas, `recap-${diary.id}.png`);
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
}

function drawDashedRect(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

async function drawAsset(ctx, src, x, y, w, h) {
  if (!src) return;
  try {
    const url = src.startsWith('/') ? `${window.location.origin}${src}` : src;
    const img = await loadImage(url);
    ctx.drawImage(img, x, y, w, h);
  } catch {
    /* skip failed asset */
  }
}

async function drawStarSticker(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(-8.92 * (Math.PI / 180));
  ctx.translate(-(x + size / 2), -(y + size / 2));
  await drawAsset(ctx, RECAP_ASSETS.starUnion, x, y, size, size);
  await drawAsset(
    ctx,
    RECAP_ASSETS.starInner,
    x + size * 0.04,
    y + size * 0.04,
    size * 0.88,
    size * 0.84,
  );
  ctx.fillStyle = '#1e1e1e';
  ctx.font = `bold ${Math.round(size * 0.057)}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('This could be', x + size / 2, y + size * 0.58);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.088)}px "Space Grotesk", sans-serif`;
  ctx.fillText('YOU!', x + size / 2, y + size * 0.82);
  ctx.restore();
}

function photoFrameRotation(slot) {
  return slot.tilt === 'left' ? -7.37 : 5.97;
}

async function drawMemoPhotoTile(ctx, memo, slot, x, y, w) {
  const photoH = 150;
  const accentH = photoH - 8;
  const accentW = w - 10;
  const frameRot = photoFrameRotation(slot);

  ctx.save();
  ctx.translate(x + w / 2, y + photoH / 2);
  ctx.rotate(frameRot * (Math.PI / 180));
  ctx.translate(-(x + w / 2), -(y + photoH / 2));

  ctx.fillStyle = slot.accentBg;
  ctx.fillRect(x + 8, y + 10, accentW, accentH);

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillRect(x + 2, y + 2, w - 8, photoH);
  ctx.shadowColor = 'transparent';

  const src = memo.mediaPreview?.url;
  if (src) {
    try {
      const url = src.startsWith('/') ? `${window.location.origin}${src}` : src;
      const img = await loadImage(url);
      drawImageCover(ctx, img, x + 8, y + 8, w - 20, photoH - 24);
    } catch {
      ctx.fillStyle = '#d8d8dc';
      ctx.fillRect(x + 8, y + 8, w - 20, photoH - 24);
    }
  } else {
    ctx.fillStyle = '#d8d8dc';
    ctx.fillRect(x + 8, y + 8, w - 20, photoH - 24);
  }

  ctx.restore();

  const day = formatRecapMemoDay(memo.date);
  ctx.fillStyle = '#1e1e1e';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(day, x + 10, y + photoH - 6);

  const quote = memo.quote?.trim() || 'A memory from this trip';
  ctx.save();
  ctx.translate(x + w / 2, y + photoH + 28);
  ctx.rotate((slot.captionRot ?? 0) * (Math.PI / 180));
  ctx.fillStyle = slot.captionBg;
  const captionW = w - 4;
  ctx.fillRect(-captionW / 2, -18, captionW, 38);
  ctx.fillStyle = '#1e1e1e';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  wrapText(ctx, truncateText(ctx, quote, captionW - 12), -captionW / 2 + 8, -2, captionW - 12, 20);
  ctx.restore();
}

function drawMemoQuoteTile(ctx, memo, slot, x, y, w) {
  const stripH = 170;
  ctx.fillStyle = slot.accentBg;
  ctx.fillRect(x + w / 2 - 8, y + 4, 16, stripH);

  ctx.save();
  ctx.translate(x + w / 2, y + 70);
  ctx.rotate((slot.captionRot ?? -4) * (Math.PI / 180));
  ctx.fillStyle = slot.captionBg;
  ctx.fillRect(-(w - 16) / 2, -36, w - 16, 88);
  ctx.fillStyle = '#1e1e1e';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  const quote = memo.quote?.trim() || 'A memory from this trip';
  wrapText(ctx, truncateText(ctx, quote, w - 36), -(w - 36) / 2 + 8, -14, w - 36, 22);
  ctx.restore();

  ctx.fillStyle = '#1e1e1e';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formatRecapMemoDay(memo.date), x + w / 2, y + stripH + 18);
}

function drawRecapRowDivider(ctx, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(90, y);
  ctx.lineTo(STORY_W - 90, y);
  ctx.stroke();
  ctx.restore();
}

/** Render styled trip recap for share/download */
export async function renderStyledRecapImage(diary, memories, styleId) {
  const style = getRecapStyle(styleId);
  const titleParts = splitJournalTitle(diary.title);
  const subtitle = buildRecapSubtitle(diary);
  const tiles = memories.slice(0, 9);

  const canvas = document.createElement('canvas');
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext('2d');

  const framePad = 28;
  const frameInnerX = framePad;
  const frameInnerY = framePad;
  const frameInnerW = STORY_W - framePad * 2;
  const frameInnerH = STORY_H - framePad * 2;

  ctx.fillStyle = style.frameBg;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  ctx.strokeStyle = style.frameBorder;
  ctx.lineWidth = 16;
  ctx.strokeRect(frameInnerX, frameInnerY, frameInnerW, frameInnerH);

  await drawAsset(ctx, RECAP_ASSETS.grid, frameInnerX, frameInnerY, frameInnerW, 460);
  await drawAsset(ctx, RECAP_ASSETS.pixelCorner, frameInnerX + 16, frameInnerY + 16, 72, 72);
  await drawStarSticker(ctx, frameInnerX + 20, frameInnerY + 80, 140);

  const sheetX = frameInnerX + 20;
  const sheetY = frameInnerY + 20;
  const sheetW = frameInnerW - 40;
  const sheetH = frameInnerH - 40;
  ctx.fillStyle = style.sheetBg;
  ctx.fillRect(sheetX, sheetY, sheetW, sheetH);

  ctx.fillStyle = style.titleSticker;
  ctx.save();
  ctx.translate(sheetX + 120, sheetY + 90);
  ctx.rotate(-0.07);
  ctx.fillRect(-90, -28, 220, 56);
  ctx.restore();

  ctx.save();
  ctx.translate(sheetX + 200, sheetY + 140);
  ctx.rotate(0.035);
  ctx.fillRect(-110, -24, 240, 48);
  ctx.restore();

  ctx.fillStyle = '#1e1e1e';
  ctx.font = 'bold 48px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(titleParts.top, sheetX + 70, sheetY + 100);
  ctx.fillText(titleParts.bottom, sheetX + 150, sheetY + 152);

  await drawAsset(ctx, RECAP_ASSETS.mapPin, sheetX + 250, sheetY + 118, 56, 56);

  const subtitleW = 520;
  const subtitleX = sheetX + (sheetW - subtitleW) / 2;
  const subtitleY = sheetY + 180;
  drawDashedRect(ctx, subtitleX, subtitleY, subtitleW, 52, style.subtitleBorder);
  ctx.fillStyle = style.subtitleText;
  ctx.font = 'italic 28px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, sheetX + sheetW / 2, subtitleY + 36);

  const rowY = [sheetY + 250, sheetY + 520, sheetY + 790];
  const colX = [sheetX + 24, sheetX + sheetW / 3 + 8, sheetX + (sheetW / 3) * 2 - 8];
  const tileW = sheetW / 3 - 24;

  for (let i = 0; i < tiles.length; i += 1) {
    const memo = tiles[i];
    const slot = RECAP_SLOTS[i];
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = colX[col];
    const y = rowY[row];
    const hasPhoto = Boolean(memo.mediaPreview?.url);

    if (slot.type === 'quote' || !hasPhoto) {
      drawMemoQuoteTile(ctx, memo, slot, x, y, tileW);
    } else {
      await drawMemoPhotoTile(ctx, memo, slot, x, y, tileW);
    }

    if (row > 0 && col === 0) {
      drawRecapRowDivider(ctx, rowY[row] - 18, style.rowDivider);
    }
  }

  await drawAsset(ctx, RECAP_ASSETS.memoSubtract, sheetX + sheetW - 120, sheetY + sheetH - 70, 36, 48);
  ctx.fillStyle = '#1e1e1e';
  ctx.font = 'bold 34px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Memo', sheetX + sheetW - 36, sheetY + sheetH - 44);
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText('me', sheetX + sheetW - 36, sheetY + sheetH - 12);

  return canvasToFile(canvas, `recap-${diary.id}-${styleId}.png`);
}

/** Download recap PNG directly — no share sheet */
export async function downloadRecapImageFile(file) {
  if (!file) throw new Error('No recap image to download');

  const url = URL.createObjectURL(file);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return { method: 'download', message: 'Recap downloaded!' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToFile(canvas, filename) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob], filename, { type: 'image/png' }));
    }, 'image/png', 0.95);
  });
}

/** Build share files for selected memo pages */
export async function buildMemoShareFiles(
  diaryId,
  memories,
  pageIndices,
  pageOffset,
  stickerCatalog = [],
  pageLayout = null,
) {
  const files = [];
  for (const pageIndex of pageIndices) {
    const memIdx = pageIndex - pageOffset;
    const memory = memories[memIdx];
    if (!memory) continue;
    const stickers = getStickersForPage(diaryId, pageIndex, pageLayout);
    const file = await renderMemoCardImage(memory, stickers, stickerCatalog);
    files.push(file);
  }
  return files;
}

/** Share one created memo as a polaroid image card. */
export async function shareSingleMemo(memo) {
  const file = await renderMemoCardImage(memo, [], []);
  return shareImageFiles([file], {
    title: memo.location || 'My memo',
    text: memo.quote ? `"${memo.quote}"` : 'Check out my memory on MemMe',
  });
}

/**
 * Share image files via native share sheet (Instagram appears on mobile)
 * or download as fallback on desktop.
 */
export async function shareImageFiles(files, { title, text } = {}) {
  if (!files.length) throw new Error('No images to share');

  const payload = { title, text, files };

  if (typeof navigator !== 'undefined' && navigator.canShare?.(payload)) {
    try {
      await navigator.share(payload);
      return { method: 'native', message: 'Opened share sheet — pick Instagram to post!' };
    } catch (err) {
      if (err.name === 'AbortError') return { method: 'cancelled', message: null };
      throw err;
    }
  }

  // Desktop / unsupported: download each image
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
  return {
    method: 'download',
    message: files.length === 1
      ? 'Image downloaded — open Instagram and upload from your gallery.'
      : `${files.length} images downloaded — upload them to Instagram from your gallery.`,
  };
}

/** Instagram-specific: always generate image + share or download */
export async function shareToInstagram(files, { title, text } = {}) {
  const result = await shareImageFiles(files, {
    title: title ?? 'MemoMe',
    text: text ?? 'My Antwerp memories',
  });

  if (result.method === 'native') {
    return 'Share sheet opened — select Instagram to post your photo!';
  }
  return result.message;
}
