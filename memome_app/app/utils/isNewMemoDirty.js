import { hasChosenMemoLocation } from './memoDraft';

export function isNewMemoDirty({ quote, selectedTags, mediaPhase, draft }) {
  if (quote.trim().length > 0) return true;
  if (selectedTags.length > 0) return true;
  if (mediaPhase !== 'idle') return true;
  if (hasChosenMemoLocation(draft)) return true;
  return false;
}
