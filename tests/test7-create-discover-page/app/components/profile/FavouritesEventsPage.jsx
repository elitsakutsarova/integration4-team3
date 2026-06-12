import { useMemo, useState } from 'react';
import { EventCard } from '../discover/DiscoverCards';
import { DISCOVER_CATEGORIES, filterDiscoverItems } from '../../data/discoverContent';
import CollectionSortChips from './CollectionSortChips';

const EVENT_FILTER_OPTIONS = DISCOVER_CATEGORIES.map(category => ({
  id: category.id,
  label: category.label,
}));

export default function FavouritesEventsPage({ favouriteEvents }) {
  const [category, setCategory] = useState('All');
  const items = useMemo(
    () => favouriteEvents.map(entry => entry.item),
    [favouriteEvents],
  );
  const filteredItems = useMemo(
    () => filterDiscoverItems(items, { category, query: '' }),
    [items, category],
  );

  return (
    <>
      <CollectionSortChips
        options={EVENT_FILTER_OPTIONS}
        value={category}
        onChange={setCategory}
      />

      <div className="collection-scroll">
        {filteredItems.length > 0 ? (
          <div className="collection-discover-list">
            {filteredItems.map(item => (
              <EventCard key={item.id} item={item} layout="list" />
            ))}
          </div>
        ) : (
          <p className="collection-empty">
            No favourite events yet. Save events from Discover to see them here.
          </p>
        )}
      </div>
    </>
  );
}
