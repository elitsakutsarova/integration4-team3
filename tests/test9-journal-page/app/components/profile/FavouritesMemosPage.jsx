import { useMemo, useState } from 'react';
import { MEMO_TAG_OPTIONS } from '../../data/memoTags';
import CollectionMemoCard from './CollectionMemoCard';
import CollectionSortChips from './CollectionSortChips';

const MEMO_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...MEMO_TAG_OPTIONS.map(tag => ({ id: tag, label: tag })),
];

function filterMemosByTag(memos, tagId) {
  if (tagId === 'all') return memos;
  return memos.filter(memo => (memo.tags ?? []).includes(tagId));
}

export default function FavouritesMemosPage({ favouriteMemos }) {
  const [memoFilter, setMemoFilter] = useState('all');
  const filteredMemos = useMemo(
    () => filterMemosByTag(favouriteMemos, memoFilter),
    [favouriteMemos, memoFilter],
  );

  return (
    <>
      <CollectionSortChips
        options={MEMO_FILTER_OPTIONS}
        value={memoFilter}
        onChange={setMemoFilter}
      />

      <div className="collection-scroll">
        {filteredMemos.length > 0 ? (
          <div className="collection-memo-list">
            {filteredMemos.map(memo => (
              <CollectionMemoCard key={memo.id} memo={memo} variant="favourite" />
            ))}
          </div>
        ) : (
          <p className="collection-empty">
            No favourite memos yet. Tap the heart on a map memo to save it here.
          </p>
        )}
      </div>
    </>
  );
}
