import { MEMO_TAG_OPTIONS, memoTagMatchesFilter } from '../data/memoTags';

export const MAP_CATEGORIES = [
  { id: 'All', label: 'All' },
  ...MEMO_TAG_OPTIONS.map((tag) => ({ id: tag, label: tag })),
];

function itemMatchesCategory(item, category) {
  if (!category || category === 'All') return true;
  return (item.tags ?? []).some((tag) => memoTagMatchesFilter(tag, category));
}

function itemMatchesQuery(item, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  return [item.quote, item.location, item.title, item.label]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(trimmed));
}

export function filterMapMemories(memos, { category = 'All', query = '' } = {}) {
  return (memos ?? []).filter(
    (memo) => itemMatchesCategory(memo, category) && itemMatchesQuery(memo, query),
  );
}

export function filterMapEvents(events, { category = 'All', query = '' } = {}) {
  return (events ?? []).filter(
    (event) => itemMatchesCategory(event, category) && itemMatchesQuery(event, query),
  );
}
