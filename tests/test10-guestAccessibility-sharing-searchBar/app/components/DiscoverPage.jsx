//  main Discover page content (container)

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CategoryIcon, EventCard, PlaceCard } from './discover/DiscoverCards';
import SearchOpenButton from './search/SearchOpenButton';
import { DISCOVER_CATEGORIES, filterDiscoverItems } from '../data/discoverContent';
import { paths } from '../utils/appPaths';

function SectionHeader({ id, title, highlightWidth, underlined, viewAllTo }) {
  return (
    <div className="discover-section-header">
      <h2
        id={id}
        className={`discover-section-title${underlined ? ' discover-section-title--underlined' : ''}`}
      >
        <span className="discover-section-highlight" style={{ width: highlightWidth }} aria-hidden="true" />
        {title}
      </h2>
      <Link to={viewAllTo} className="discover-view-all">
        View all
        <svg width="6" height="12" viewBox="0 0 6 12" fill="none" aria-hidden="true">
          <path d="M1 1l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default function DiscoverPage({ happeningNow, upcoming, places }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filters = useMemo(
    () => ({ category: activeCategory, query: '' }),
    [activeCategory],
  );

  const filteredHappeningNow = useMemo(
    () => filterDiscoverItems(happeningNow, filters),
    [happeningNow, filters],
  );
  const filteredUpcoming = useMemo(
    () => filterDiscoverItems(upcoming, filters),
    [upcoming, filters],
  );
  const filteredPlaces = useMemo(
    () => filterDiscoverItems(places, filters),
    [places, filters],
  );

  return (
    <div className="discover-page">
      <header className="discover-hero">
        <div className="discover-grid-deco" aria-hidden="true">
          <div className="discover-grid-gradient" />
          <div className="discover-grid-pattern" />
        </div>

        <SearchOpenButton className="discover-search discover-search--trigger" variant="discover" />
      </header>

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

      <section className="discover-section" aria-labelledby="discover-happening-now">
        <SectionHeader
          title="Happening now"
          highlightWidth="172px"
          id="discover-happening-now"
          viewAllTo={paths.discoverHappeningNow}
        />
        <div className="discover-carousel">
          {filteredHappeningNow.length > 0 ? (
            filteredHappeningNow.map(item => <EventCard key={item.id} item={item} />)
          ) : (
            <p className="discover-empty">No live events match your filters.</p>
          )}
        </div>
      </section>

      <section className="discover-section discover-section--upcoming" aria-labelledby="discover-upcoming">
        <SectionHeader
          id="discover-upcoming"
          title="Upcoming"
          highlightWidth="116px"
          viewAllTo={paths.discoverUpcoming}
        />
        <div className="discover-carousel">
          {filteredUpcoming.length > 0 ? (
            filteredUpcoming.map(item => <EventCard key={item.id} item={item} />)
          ) : (
            <p className="discover-empty">No upcoming events match your filters.</p>
          )}
        </div>
      </section>

      <section className="discover-section discover-section--places" aria-labelledby="discover-places">
        <div className="discover-pin-deco" aria-hidden="true">
          <svg className="discover-pin-line" viewBox="0 0 400 70" preserveAspectRatio="none">
            <path d="M0 55 C120 10, 220 80, 400 20" fill="none" stroke="#1952ff" strokeWidth="2" strokeDasharray="4 6" />
          </svg>
          <svg className="discover-pin-icon" width="24" height="32" viewBox="0 0 24 32" fill="none">
            <path d="M12 1C7.03 1 3 5.03 3 10c0 7.5 9 19 9 19s9-11.5 9-19c0-4.97-4.03-9-9-9z" fill="#00b26f" stroke="#002c1c" strokeWidth="1" />
            <circle cx="12" cy="10" r="3" fill="#66ebb9" />
          </svg>
        </div>
        <SectionHeader
          id="discover-places"
          title="Places worth a memo"
          highlightWidth="229px"
          underlined
          viewAllTo={paths.discoverPlaces}
        />
        <div className="discover-place-list">
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map(item => <PlaceCard key={item.id} item={item} />)
          ) : (
            <p className="discover-empty">No places match your filters.</p>
          )}
        </div>
      </section>
    </div>
  );
}
