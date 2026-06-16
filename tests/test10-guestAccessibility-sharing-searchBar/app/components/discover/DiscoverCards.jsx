// presentation/UI components for the discover page

import { Link } from 'react-router';
import { discoverEventPath, discoverPlacePath } from '../../utils/appPaths';
import { DiscoverFavoriteButton } from './DiscoverFavoriteButton';

export function CategoryIcon({ name }) {
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

export function EventCard({ item, layout = 'carousel', showFave = true }) {
  const cardClass = layout === 'list'
    ? 'discover-event-card discover-event-card--list'
    : 'discover-event-card';

  return (
    <article className={cardClass}>
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
        {showFave && (
          <DiscoverFavoriteButton type="event" itemId={item.id} label={item.title} />
        )}
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
        <Link to={discoverEventPath(item.id)} className="discover-learn-more">
          Learn more
        </Link>
      </div>
    </article>
  );
}

export function PlaceCard({ item, layout = 'carousel', faveId, showFave = true, faveMeta }) {
  const favoriteItemId = faveId ?? item.id;
  const cardClass = layout === 'list'
    ? 'discover-place-card discover-place-card--list'
    : 'discover-place-card';

  return (
    <article className={cardClass}>
      <div className="discover-place-card-media">
        <img src={item.image} alt="" className="discover-place-card-image" />
        <span className="discover-tag discover-tag--on-image">{item.tags[0]}</span>
      </div>
      <div className="discover-place-card-body">
        {showFave && favoriteItemId && (
          <DiscoverFavoriteButton
            type="place"
            itemId={favoriteItemId}
            label={item.title}
            meta={faveMeta}
          />
        )}
        <h3 className="discover-place-card-title">{item.title}</h3>
        <p className="discover-event-card-meta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="discover-location-link">{item.location}</span>
        </p>
        <Link to={discoverPlacePath(item.id)} className="discover-learn-more">
          Learn more
        </Link>
      </div>
    </article>
  );
}
