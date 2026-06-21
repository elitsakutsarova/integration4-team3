/** Pre-selected tag when opening the add-memo form. */
export const DEFAULT_MEMO_TAG = 'Food';

/** Tag options shown when publishing a new map memo. */
export const MEMO_TAG_OPTIONS = [
  'Food',
  'Nightlife',
  'Fashion',
  'Art & Culture',
  'Music',
  'Nature',
  'Random',
];

const ICON_KEYS = {
  Food: 'food',
  Nightlife: 'nightlife',
  Fashion: 'fashion',
  'Art & Culture': 'art',
  Music: 'music',
  Nature: 'nature',
  Random: 'random',
};

export function normalizeMemoTag(tag) {
  return String(tag ?? '').trim().toLowerCase();
}

export function memoTagIconKey(tag) {
  if (ICON_KEYS[tag]) return ICON_KEYS[tag];
  const normalized = normalizeMemoTag(tag);
  const match = MEMO_TAG_OPTIONS.find((option) => normalizeMemoTag(option) === normalized);
  return match ? ICON_KEYS[match] : normalized;
}

export function memoTagMatchesFilter(tag, category) {
  if (!category || category === 'All') return true;
  return normalizeMemoTag(tag) === normalizeMemoTag(category);
}
