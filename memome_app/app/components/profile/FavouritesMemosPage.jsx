import { useMemo, useState } from 'react';
import { filterMapMemories } from '../../utils/mapFilters';
import CollectionMemoCard from './CollectionMemoCard';
import CreatedMemoCategoryChips from './CreatedMemoCategoryChips';
import FavouritesEmptyState from './FavouritesEmptyState';

export default function FavouritesMemosPage({ favouriteMemos }) {
  const [category, setCategory] = useState('All');
  const filteredMemos = useMemo(
    () => filterMapMemories(favouriteMemos, { category }),
    [favouriteMemos, category],
  );

  return (
    <>
      <CreatedMemoCategoryChips value={category} onChange={setCategory} />

      <div className="collection-scroll collection-scroll--favourites">
        {filteredMemos.length > 0 ? (
          <div className="collection-memo-list">
            {filteredMemos.map(memo => (
              <CollectionMemoCard key={memo.id} memo={memo} />
            ))}
          </div>
        ) : favouriteMemos.length === 0 ? (
          <FavouritesEmptyState kind="memos" />
        ) : (
          <p className="collection-empty">No memos in this category yet.</p>
        )}
      </div>
    </>
  );
}
