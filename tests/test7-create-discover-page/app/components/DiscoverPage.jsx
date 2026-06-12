//  main Discover page content (container)

import { useMemo, useState } from 'react';
import { Link, href } from 'react-router';
import BottomNav from './BottomNav';
import DiscoverSavedModal from './discover/DiscoverSavedModal';
import { CategoryIcon, EventCard, PlaceCard } from './discover/DiscoverCards';
import {
  DISCOVER_CATEGORIES,
  HAPPENING_NOW,
  PLACES_WORTH_MEMO,
  UPCOMING,
  filterDiscoverItems,
} from '../data/discoverContent';

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

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = useMemo(
    () => ({ category: activeCategory, query: searchQuery }),
    [activeCategory, searchQuery],
  );

  const happeningNow = useMemo(
    () => filterDiscoverItems(HAPPENING_NOW, filters),
    [filters],
  );
  const upcoming = useMemo(
    () => filterDiscoverItems(UPCOMING, filters),
    [filters],
  );
  const places = useMemo(
    () => filterDiscoverItems(PLACES_WORTH_MEMO, filters),
    [filters],
  );

  return (
    <div className="discover-page">
      <header className="discover-hero">
        <div className="discover-grid-deco" aria-hidden="true">
          <div className="discover-grid-gradient" />
          <div className="discover-grid-pattern" />
        </div>

        <label className="discover-search">
          <svg className="discover-search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="discover-search-input"
            placeholder="Search Antwerp..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            aria-label="Search Antwerp"
          />
          <button type="button" className="discover-search-mic" aria-label="Voice search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </label>
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
          viewAllTo={href('/discover/happening-now')}
        />
        <div className="discover-carousel">
          {happeningNow.length > 0 ? (
            happeningNow.map(item => <EventCard key={item.id} item={item} />)
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
          viewAllTo={href('/discover/upcoming')}
        />
        <div className="discover-carousel">
          {upcoming.length > 0 ? (
            upcoming.map(item => <EventCard key={item.id} item={item} />)
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
          viewAllTo={href('/discover/places')}
        />
        <div className="discover-place-list">
          {places.length > 0 ? (
            places.map(item => <PlaceCard key={item.id} item={item} />)
          ) : (
            <p className="discover-empty">No places match your filters.</p>
          )}
        </div>
      </section>

      <BottomNav />
      <DiscoverSavedModal />
    </div>
  );
}
