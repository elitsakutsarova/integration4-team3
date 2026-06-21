import { useMemo, useState } from 'react';
import ShareSheet from '../diary/ShareSheet';
import DiscoverShareSuccess from '../discover/DiscoverShareSuccess';
import CreatedMemoCard from './CreatedMemoCard';
import CreatedMemoCategoryChips from './CreatedMemoCategoryChips';
import FavouritesEmptyState from './FavouritesEmptyState';
import { useMemoShare } from '../../hooks/useMemoShare';
import { filterMapMemories } from '../../utils/mapFilters';

export default function FavouritesMemosPage({
  favouriteMemos,
  favouriteMemosPending = false,
}) {
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
    () => filterMapMemories(favouriteMemos, { category }),
    [favouriteMemos, category],
  );

  return (
    <>
      <CreatedMemoCategoryChips value={category} onChange={setCategory} />

      <div className="collection-scroll collection-scroll--favourites collection-scroll--favourites-memos">
        {favouriteMemosPending && favouriteMemos.length === 0 ? (
          <div className="auth-loading">
            <div className="auth-loading-dot" />
          </div>
        ) : filteredMemos.length > 0 ? (
          <div className="collection-memo-list collection-memo-list--created">
            {filteredMemos.map(memo => (
              <CreatedMemoCard
                key={memo.id}
                memo={memo}
                onShare={() => openShare(memo)}
                showFavoriteInsteadOfEdit
              />
            ))}
          </div>
        ) : favouriteMemos.length === 0 ? (
          <FavouritesEmptyState kind="memos" />
        ) : (
          <p className="collection-empty">No memos in this category yet.</p>
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
    </>
  );
}
