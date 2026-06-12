import { useMemo, useState } from 'react';
import BottomNav from './BottomNav';
import {
  DISCOVER_CATEGORIES,
  HAPPENING_NOW,
  PLACES_WORTH_MEMO,
  UPCOMING,
  filterDiscoverItems,
} from '../data/discoverContent';

function CategoryIcon({ name }) {
  if (name === 'food') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 11h18M3 15h18M6 7v14M12 7v14M18 7v14" />
      </svg>
    );
  }
  if (name === 'nightlife') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  if (name === 'fashion') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 3l3 3 3-3 3 3 3-3v18H6V3z" />
      </svg>
    );
  }
  if (name === 'art') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    );
  }
  if (name === 'music') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h16v16H4z" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

function SectionHeader({ id, title, highlightWidth, underlined }) {
  return (
    <div className="discover-section-header">
      <h2
        id={id}
        className={`discover-section-title${underlined ? ' discover-section-title--underlined' : ''}`}
      >
        <span className="discover-section-highlight" style={{ width: highlightWidth }} aria-hidden="true" />
        {title}
      </h2>
      <button type="button" className="discover-view-all">
        View all
        <svg width="6" height="12" viewBox="0 0 6 12" fill="none" aria-hidden="true">
          <path d="M1 1l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function FavoriteButton({ label }) {
  return (
    <button type="button" className="discover-fave-btn" aria-label={`Save ${label} to favorites`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="#1952ff"
          strokeWidth="1.8"
        />
      </svg>
    </button>
  );
}

function EventCard({ item }) {
  return (
    <article className="discover-event-card">
      <div className="discover-event-card-media">
        <img src={item.image} alt="" className="discover-event-card-image" />
        {item.live && (
          <span className="discover-live-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="#1952ff" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#1952ff" strokeWidth="1.5" />
            </svg>
            Live event
          </span>
        )}
        <FavoriteButton label={item.title} />
        <div className="discover-event-card-tags">
          {item.tags.map(tag => (
            <span key={tag} className="discover-tag">{tag}</span>
          ))}
        </div>
      </div>
      <div className="discover-event-card-body">
        <h3 className="discover-event-card-title">{item.title}</h3>
        <p className="discover-event-card-meta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          {item.date}
        </p>
        <p className="discover-event-card-meta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="discover-location-link">{item.location}</span>
        </p>
        <button type="button" className="discover-learn-more">Learn more</button>
      </div>
    </article>
  );
}

function PlaceCard({ item }) {
  return (
    <article className="discover-place-card">
      <div className="discover-place-card-media">
        <img src={item.image} alt="" className="discover-place-card-image" />
        <span className="discover-tag discover-tag--on-image">{item.tags[0]}</span>
      </div>
      <div className="discover-place-card-body">
        <FavoriteButton label={item.title} />
        <h3 className="discover-place-card-title">{item.title}</h3>
        <p className="discover-event-card-meta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="discover-location-link">{item.location}</span>
        </p>
        <button type="button" className="discover-learn-more">Learn more</button>
      </div>
    </article>
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
        <SectionHeader title="Happening now" highlightWidth="172px" id="discover-happening-now" />
        <div className="discover-carousel">
          {happeningNow.length > 0 ? (
            happeningNow.map(item => <EventCard key={item.id} item={item} />)
          ) : (
            <p className="discover-empty">No live events match your filters.</p>
          )}
        </div>
      </section>

      <section className="discover-section discover-section--upcoming" aria-labelledby="discover-upcoming">
        <SectionHeader id="discover-upcoming" title="Upcoming" highlightWidth="116px" />
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
        <SectionHeader id="discover-places" title="Places worth a memo" highlightWidth="229px" underlined />
        <div className="discover-place-list">
          {places.length > 0 ? (
            places.map(item => <PlaceCard key={item.id} item={item} />)
          ) : (
            <p className="discover-empty">No places match your filters.</p>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
