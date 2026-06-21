import { useMemo, useState } from 'react';
import { EventCard } from '../discover/DiscoverCards';
import { filterDiscoverItems } from '../../data/discoverContent';
import { useEventVenueHrefs } from '../../hooks/useEventVenueHrefs';
import CreatedMemoCategoryChips from './CreatedMemoCategoryChips';
import FavouritesEmptyState from './FavouritesEmptyState';

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
      <CreatedMemoCategoryChips value={category} onChange={setCategory} />

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
