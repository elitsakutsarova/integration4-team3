import { useMemo, useState } from 'react';
import { EventCard } from '../discover/DiscoverCards';
import { DISCOVER_CATEGORIES, filterDiscoverItems } from '../../data/discoverContent';
import { useEventVenueHrefs } from '../../hooks/useEventVenueHrefs';
import CollectionSortChips from './CollectionSortChips';
import FavouritesEmptyState from './FavouritesEmptyState';

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
  const venueHrefs = useEventVenueHrefs(items);

  return (
    <>
      <CollectionSortChips
        options={EVENT_FILTER_OPTIONS}
        value={category}
        onChange={setCategory}
      />

      <div className="collection-scroll collection-scroll--favourites">
        {filteredItems.length > 0 ? (
          <div className="collection-discover-list">
            {filteredItems.map(item => (
              <EventCard key={item.id} item={item} layout="list" venueHref={venueHrefs[item.id] ?? null} />
            ))}
          </div>
        ) : favouriteEvents.length === 0 ? (
          <FavouritesEmptyState kind="events" />
        ) : (
          <p className="collection-empty">No events in this category yet.</p>
        )}
      </div>
    </>
  );
}
