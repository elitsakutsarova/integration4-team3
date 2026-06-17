import { useMemo, useState } from 'react';
import { PlaceCard } from '../discover/DiscoverCards';
import { DISCOVER_CATEGORIES, filterDiscoverItems } from '../../data/discoverContent';
import CollectionSortChips from './CollectionSortChips';
import FavouritesEmptyState from './FavouritesEmptyState';

const SPOT_FILTER_OPTIONS = DISCOVER_CATEGORIES.map(category => ({
  id: category.id,
  label: category.label,
}));

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
      <CollectionSortChips
        options={SPOT_FILTER_OPTIONS}
        value={category}
        onChange={setCategory}
      />

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
