const ART_CULTURE_ALIASES = ['art & culture', 'sightseeing', 'museum', 'street art'];

export const MAP_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'Food', label: 'Food' },
  { id: 'Nightlife', label: 'Nightlife' },
  { id: 'Fashion', label: 'Fashion' },
  { id: 'Art & Culture', label: 'Art & Culture' },
];

function tagMatchesCategory(tag, category) {
  const normalized = String(tag).trim().toLowerCase();
  if (category === 'Art & Culture') {
    return ART_CULTURE_ALIASES.some(alias => normalized.includes(alias))
      || normalized.includes('art')
      || normalized.includes('culture');
  }
  return normalized === category.toLowerCase();
}

function itemMatchesCategory(item, category) {
  if (!category || category === 'All') return true;
  return (item.tags ?? []).some(tag => tagMatchesCategory(tag, category));
}

function itemMatchesQuery(item, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  return [item.quote, item.location, item.title, item.label]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(trimmed));
}

export function filterMapMemories(memos, { category = 'All', query = '' } = {}) {
  return (memos ?? []).filter(
    memo => itemMatchesCategory(memo, category) && itemMatchesQuery(memo, query),
  );
}

export function filterMapEvents(events, { category = 'All', query = '' } = {}) {
  return (events ?? []).filter(
    event => itemMatchesCategory(event, category) && itemMatchesQuery(event, query),
  );
}
