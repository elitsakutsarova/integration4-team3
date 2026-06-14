export const RECAP_MAX_MEMOS = 9;

export const RECAP_ASSETS = {
  grid: '/journals/recap/grid.svg',
  pixelCorner: '/journals/recap/pixel-corner.svg',
  mapPin: '/journals/recap/map-pin.svg',
  starUnion: '/journals/recap/star-union.svg',
  starInner: '/journals/recap/star-inner.svg',
  memoSubtract: '/journals/recap/memo-subtract.svg',
};

/**
 * Per-slot definitions derived from Figma node 679:51480.
 * Row-major order: [row0-col0, row0-col1, row0-col2, row1-col0, ...]
 *
 * tilt: 'left'  → frame rotate(-7.37deg), accent peeks from right
 * tilt: 'right' → frame rotate(5.97deg),  accent peeks from left
 * type: 'quote' → compact horizontal strip (~46px tall)
 */
export const RECAP_SLOTS = [
  // Row 0
  { type: 'photo', accentBg: '#00de8b', captionBg: '#f9ff75', tilt: 'left',  captionRot: 3.48 },
  { type: 'photo', accentBg: '#00de8b', captionBg: '#d1dcff', tilt: 'right', captionRot: -2.08 },
  { type: 'quote', accentBg: '#7597ff', captionBg: '#f9ff75', captionRot: -4.01 },
  // Row 1
  { type: 'photo', accentBg: '#99f2d1', captionBg: '#f9ff75', tilt: 'right', captionRot: -2.08 },
  { type: 'quote', accentBg: '#00de8b', captionBg: '#f9ff75', captionRot: 3.71 },
  { type: 'photo', accentBg: '#1952ff', captionBg: '#ccf8e8', tilt: 'left',  captionRot: 3.48 },
  // Row 2
  { type: 'photo', accentBg: '#00de8b', captionBg: '#d1dcff', tilt: 'left',  captionRot: 3.48 },
  { type: 'photo', accentBg: '#00de8b', captionBg: '#f9ff75', tilt: 'right', captionRot: -2.08 },
  { type: 'quote', accentBg: '#00de8b', captionBg: '#e4eaff', captionRot: -4.01 },
];

export const RECAP_STYLES = [
  {
    id: 'classic',
    label: 'Classic',
    frameBg: '#66ebb9',
    frameBorder: '#1952ff',
    subtitleBorder: '#7597ff',
    subtitleText: '#1e1e1e',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    frameBg: '#d1dcff',
    frameBorder: '#4775ff',
    subtitleBorder: '#4775ff',
    subtitleText: '#1e1e1e',
  },
  {
    id: 'night',
    label: 'Night',
    frameBg: '#a3baff',
    frameBorder: '#1952ff',
    subtitleBorder: '#1952ff',
    subtitleText: '#1e1e1e',
  },
];

export function getRecapStyle(styleId) {
  return RECAP_STYLES.find((s) => s.id === styleId) ?? RECAP_STYLES[0];
}

export function formatRecapMemoDay(dateLabel) {
  const text = String(dateLabel ?? '').trim();
  if (!text) return '';
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  return text;
}

export function splitJournalTitle(title) {
  const words = String(title ?? 'Antwerp Getaway').trim().split(/\s+/);
  if (words.length <= 1) return { top: words[0] || 'Trip', bottom: 'Recap' };
  const mid = Math.ceil(words.length / 2);
  return { top: words.slice(0, mid).join(' '), bottom: words.slice(mid).join(' ') };
}

export function buildRecapSubtitle(journal) {
  return `Trip to ${String(journal?.title ?? 'Antwerp').trim()} Recap`;
}
