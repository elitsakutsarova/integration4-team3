import { useMemo, useState } from 'react';
import { PlaceCard } from '../discover/DiscoverCards';
import { filterDiscoverItems } from '../../data/discoverContent';
import CreatedMemoCategoryChips from './CreatedMemoCategoryChips';
import FavouritesEmptyState from './FavouritesEmptyState';

export default function FavouritesSpotsPage({ favouritePlaces }) {
  const [category, setCategory] = useState('All');
  const items = useMemo(
    () => favouritePlaces.map(entry => entry.item),
    [favouritePlaces],
  );
  const filteredItems = useMemo(
    () => filterDiscoverItems(items, { category, query: '' }),
    [items, category],
  );

  return (
    <>
      <CreatedMemoCategoryChips value={category} onChange={setCategory} />

      <div className="collection-scroll collection-scroll--favourites">
        {filteredItems.length > 0 ? (
          <div className="collection-discover-list collection-discover-list--places">
            {filteredItems.map(item => (
              <PlaceCard key={item.id} item={item} layout="list" />
            ))}
          </div>
        ) : favouritePlaces.length === 0 ? (
          <FavouritesEmptyState kind="spots" />
        ) : (
          <p className="collection-empty">No spots in this category yet.</p>
        )}
      </div>
    </>
  );
}
