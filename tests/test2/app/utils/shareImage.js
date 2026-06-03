/**
 * Renders memo/diary pages to PNG blobs for real sharing (Instagram, etc.)
 */

import { loadPageStickers } from './stickerTracker';

const CARD_W = 1080;
const CARD_H = 1440;

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

function drawStickers(ctx, stickers, photoX, photoY, photoW, photoH) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.round(photoW * 0.14);
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

  for (const s of stickers) {
    const sx = photoX + (s.x / 100) * photoW;
    const sy = photoY + (s.y / 100) * photoH;
    ctx.fillText(s.emoji, sx, sy);
  }
}

/** Render a single memo page card (polaroid style) */
export async function renderMemoCardImage(memory, stickers = []) {
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

  drawStickers(ctx, stickers, photoX, photoY, photoW, photoH);

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

function canvasToFile(canvas, filename) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob], filename, { type: 'image/png' }));
    }, 'image/png', 0.95);
  });
}

/** Build share files for selected memo pages */
export async function buildMemoShareFiles(diaryId, memories, pageIndices, pageOffset) {
  const files = [];
  for (const pageIndex of pageIndices) {
    const memIdx = pageIndex - pageOffset;
    const memory = memories[memIdx];
    if (!memory) continue;
    const stickers = loadPageStickers(diaryId, pageIndex);
    const file = await renderMemoCardImage(memory, stickers);
    files.push(file);
  }
  return files;
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
