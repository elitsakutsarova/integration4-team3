// this component displays the created memos page

import { useMemo, useState } from 'react';
import BottomNav from '../BottomNav';
import CollectionMemoCard from './CollectionMemoCard';
import CollectionPageHeader from './CollectionPageHeader';
import CollectionSortChips from './CollectionSortChips';

const SORT_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'oldest', label: 'Oldest added' },
  { id: 'az', label: 'A-Z' },
  { id: 'za', label: 'Z-A' },
];

function sortMemos(memos, sortId) {
  const next = [...memos];

  switch (sortId) {
    case 'oldest':
      return next.reverse();
    case 'az':
      return next.sort((a, b) => String(a.location).localeCompare(String(b.location)));
    case 'za':
      return next.sort((a, b) => String(b.location).localeCompare(String(a.location)));
    case 'recent':
    case 'all':
    default:
      return next;
  }
}

export default function CreatedMemosPage({ memos }) {
  const [sortId, setSortId] = useState('all');
  const sortedMemos = useMemo(() => sortMemos(memos, sortId), [memos, sortId]);

  return (
    <div className="collection-page">
      <CollectionPageHeader title="Created Memos" />
      <CollectionSortChips options={SORT_OPTIONS} value={sortId} onChange={setSortId} />

      <div className="collection-scroll">
        {sortedMemos.length > 0 ? (
          <div className="collection-memo-list">
            {sortedMemos.map(memo => (
              <CollectionMemoCard key={memo.id} memo={memo} variant="created" showHeart={false} />
            ))}
          </div>
        ) : (
          <p className="collection-empty">
            You haven&apos;t created any memos yet. Tap + on the map to share your first memory.
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
