import { MEMO_TAG_OPTIONS } from './memoTags';
import { MEMO_PIN_SVG } from '../utils/memoPinAssets';

const PIN_ICON_KEYS = ['food', 'nightlife', 'fashion', 'art', 'music', 'nature', 'random'];
const DEFAULT_PIN_ID_PREFIX = 'memo-pin-';

export function isDefaultJournalPinSticker(stickerId) {
  return typeof stickerId === 'string' && stickerId.startsWith(DEFAULT_PIN_ID_PREFIX);
}

/** QR-scanned collectibles — not memo pins or achievement milestones. */
export function isQrCollectedJournalSticker(stickerId) {
  if (typeof stickerId !== 'string' || !stickerId) return false;
  if (isDefaultJournalPinSticker(stickerId)) return false;
  if (stickerId.startsWith('achievement-')) return false;
  return true;
}

/** Free memo-pin stickers every logged-in user can use in journals (not QR collectibles). */
export const DEFAULT_JOURNAL_STICKERS = MEMO_TAG_OPTIONS.map((label, index) => {
  const key = PIN_ICON_KEYS[index];
  return {
    id: `memo-pin-${key}`,
    src: MEMO_PIN_SVG[key],
    label,
  };
});

export function mergeDefaultJournalStickers(byId, user) {
  if (!user) return;
  for (const sticker of DEFAULT_JOURNAL_STICKERS) {
    byId.set(sticker.id, sticker);
  }
}

export function withDefaultJournalStickers(collected, user) {
  if (!user) return collected;
  const byId = new Map();
  mergeDefaultJournalStickers(byId, user);
  for (const sticker of collected) byId.set(sticker.id, sticker);
  return [...byId.values()];
}
