// this component displays the created memos page

import { useMemo, useState } from 'react';
import BottomNav from '../BottomNav';
import ShareSheet from '../diary/ShareSheet';
import DiscoverShareSuccess from '../discover/DiscoverShareSuccess';
import CollectionMemoCard from './CollectionMemoCard';
import CreatedMemoCategoryChips from './CreatedMemoCategoryChips';
import CreatedMemosPageHeader from './CreatedMemosPageHeader';
import { useMemoShare } from '../../hooks/useMemoShare';
import { filterMapMemories } from '../../utils/mapFilters';

export default function CreatedMemosPage({ memos }) {
  const [category, setCategory] = useState('All');
  const {
    shareMemo,
    openShare,
    closeShare,
    confirmShare,
    showSuccess,
    closeSuccess,
    sharing,
  } = useMemoShare();

  const filteredMemos = useMemo(
    () => filterMapMemories(memos, { category }),
    [memos, category],
  );

  return (
    <div className="collection-page collection-page--created-memos">
      <CreatedMemosPageHeader />
      <CreatedMemoCategoryChips value={category} onChange={setCategory} />

      <div className="collection-scroll">
        {filteredMemos.length > 0 ? (
          <div className="collection-memo-list collection-memo-list--created">
            {filteredMemos.map((memo, index) => (
              <CollectionMemoCard
                key={memo.id}
                memo={memo}
                variant="created"
                showHeart
                layout={index % 2 === 0 ? 'horizontal' : 'vertical'}
                onShare={() => openShare(memo)}
              />
            ))}
          </div>
        ) : (
          <p className="collection-empty">
            {category === 'All'
              ? "You haven't created any memos yet. Tap + on the map to share your first memory."
              : 'No memos in this category yet.'}
          </p>
        )}
      </div>

      {shareMemo && (
        <ShareSheet
          title="Share memo"
          countLabel={shareMemo.location || 'My memo'}
          onClose={closeShare}
          onShareApp={confirmShare}
          onShareContact={confirmShare}
          disabled={sharing}
        />
      )}

      {showSuccess && (
        <DiscoverShareSuccess variant="memo" onClose={closeSuccess} />
      )}

      <BottomNav />
    </div>
  );
}
