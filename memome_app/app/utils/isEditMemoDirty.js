// checks whether the user has made any changes while editing a memo

function tagsEqual(left, right) {
  const primary = (tags) => (tags ?? [])[0] ?? '';
  return primary(left) === primary(right);
}

export function isEditMemoDirty(memo, state) {
  if (!memo) return false;

  if (state.quote.trim() !== String(memo.quote ?? '').trim()) return true;
  if (!tagsEqual(state.selectedTags, memo.tags)) return true;

  const initialLat = memo.ll?.[0];
  const initialLng = memo.ll?.[1];
  if (Number(state.locationDraft.lat) !== Number(initialLat)) return true;
  if (Number(state.locationDraft.lng) !== Number(initialLng)) return true;
  if (state.locationDraft.name?.trim() !== String(memo.location ?? '').trim()) return true;
  if (String(state.locationDraft.placeId ?? '') !== String(memo.placeId ?? '')) return true;

  if (state.removeMedia && state.initialHadMedia) return true;
  if (state.mediaPreview?.file) return true;
  if (!state.initialHadMedia && state.mediaPreview?.url) return true;

  return false;
}
