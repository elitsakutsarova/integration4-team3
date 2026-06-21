import { DEFAULT_MEMO_TAG } from '../data/memoTags';
import { hasChosenMemoLocation } from './memoDraft';

function hasCustomTagSelection(selectedTags) {
  return selectedTags.length !== 1 || selectedTags[0] !== DEFAULT_MEMO_TAG;
}

export function isNewMemoDirty({ quote, selectedTags, mediaPhase, draft }) {
  if (quote.trim().length > 0) return true;
  if (hasCustomTagSelection(selectedTags)) return true;
  if (mediaPhase !== 'idle') return true;
  if (hasChosenMemoLocation(draft)) return true;
  return false;
}
