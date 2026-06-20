// re-usable "View All" page for the Discover feature

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CategoryIcon, EventCard, PlaceCard } from './DiscoverCards';
import { paths } from '../../utils/appPaths';
import { useEventVenueHrefs } from '../../hooks/useEventVenueHrefs';
import {
  DISCOVER_CATEGORIES,
  filterDiscoverItems,
} from '../../data/discoverContent';

function DiscoverListHeader({
  title,
  highlightWidth,
  underlined = false,
  decoration = 'none',
}) {
  return (
    <header className="discover-list-header">
      <div className="discover-grid-deco" aria-hidden="true">
        <div className="discover-grid-gradient" />
        <div className="discover-grid-pattern" />
      </div>

      {decoration === 'upcoming' && (
        <div className="discover-list-arrow-deco" aria-hidden="true">
          <svg viewBox="0 0 320 58" preserveAspectRatio="none">
            <path
              d="M0 40 C80 8, 160 52, 320 18"
              fill="none"
              stroke="#1952ff"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
          </svg>
          <span className="discover-list-arrow-label">Good plans start here</span>
        </div>
      )}

      {decoration === 'places' && (
        <div className="discover-list-pin-deco" aria-hidden="true">
          <svg className="discover-pin-line" viewBox="0 0 400 70" preserveAspectRatio="none">
            <path d="M0 55 C120 10, 220 80, 400 20" fill="none" stroke="#1952ff" strokeWidth="2" strokeDasharray="4 6" />
          </svg>
          <svg className="discover-pin-icon" width="24" height="32" viewBox="0 0 24 32" fill="none">
            <path d="M12 1C7.03 1 3 5.03 3 10c0 7.5 9 19 9 19s9-11.5 9-19c0-4.97-4.03-9-9-9z" fill="#00b26f" stroke="#002c1c" strokeWidth="1" />
            <circle cx="12" cy="10" r="3" fill="#66ebb9" />
          </svg>
        </div>
      )}

      <div className="discover-list-title-row">
        <Link to={paths.discover} className="discover-list-back" aria-label="Back to Discover">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <h1
          className={`discover-list-title${underlined ? ' discover-list-title--underlined' : ''}`}
        >
          <span className="discover-section-highlight" style={{ width: highlightWidth }} aria-hidden="true" />
          {title}
        </h1>

        {decoration === 'live' && (
          <div className="discover-list-live-star" aria-hidden="true">
            <svg width="62" height="67" viewBox="0 0 62 67" fill="none">
              <path d="M31 0l7.6 23.4H63L41.7 37.8l7.6 23.4L31 47.2 12.7 61.2l7.6-23.4L0 23.4h24.4L31 0z" fill="#1952ff" />
            </svg>
            <span>Live</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default function DiscoverListPage({
  title,
  highlightWidth,
  underlined = false,
  decoration = 'none',
  items,
  itemType,
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filters = useMemo(
    () => ({ category: activeCategory, query: '' }),
    [activeCategory],
  );

  const filteredItems = useMemo(
    () => filterDiscoverItems(items, filters),
    [items, filters],
  );
  const venueHrefs = useEventVenueHrefs(itemType === 'event' ? items : []);

  return (
    <div className="discover-list-page">
      <DiscoverListHeader
        title={title}
        highlightWidth={highlightWidth}
        underlined={underlined}
        decoration={decoration}
      />

      <div className="discover-filters" role="tablist" aria-label="Discover categories">
        {DISCOVER_CATEGORIES.map(category => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`discover-filter-chip${isActive ? ' discover-filter-chip--active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon && <CategoryIcon name={category.icon} />}
              {category.label}
            </button>
          );
        })}
      </div>

      <div className={`discover-list-content${itemType === 'place' ? ' discover-list-content--places' : ''}`}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            itemType === 'place'
              ? <PlaceCard key={item.id} item={item} layout="list" />
              : <EventCard key={item.id} item={item} layout="list" venueHref={venueHrefs[item.id] ?? null} />
          ))
        ) : (
          <p className="discover-empty">No items match your filters.</p>
        )}
      </div>
    </div>
  );
}
