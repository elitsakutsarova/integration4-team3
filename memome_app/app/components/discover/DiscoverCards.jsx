// presentation/UI components for the discover page

import { Link } from 'react-router';
import { discoverEventPath, discoverPlacePath } from '../../utils/appPaths';
import { DiscoverFavoriteButton } from './DiscoverFavoriteButton';

export { DiscoverCategoryIcon as CategoryIcon } from '../MemoTagIcon';

export function EventCard({ item, layout = 'carousel', showFave = true, venueHref = null }) {
  const cardClass = layout === 'list'
    ? 'discover-event-card discover-event-card--list'
    : 'discover-event-card';

  return (
    <article className={cardClass}>
      <div className="discover-event-card-media">
        <img src={item.image} alt="" className="discover-event-card-image" />
        {item.live && (
          <div className="discover-live-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M2.92901 2.92896L4.34301 4.34296C3.59926 5.0852 3.00942 5.96701 2.60735 6.93779C2.20527 7.90857 1.99888 8.9492 2.00001 9.99996C2.00001 12.21 2.89501 14.21 4.34301 15.657L2.92901 17.071C1.99909 16.1434 1.26162 15.0412 0.758965 13.8277C0.256313 12.6142 -0.00161208 11.3134 7.58097e-06 9.99996C-0.00161208 8.6865 0.256313 7.38567 0.758965 6.1722C1.26162 4.95873 1.99909 3.85654 2.92901 2.92896ZM17.071 2.92896C18.0009 3.85654 18.7384 4.95873 19.2411 6.1722C19.7437 7.38567 20.0016 8.6865 20 9.99996C20.0016 11.3134 19.7437 12.6142 19.2411 13.8277C18.7384 15.0412 18.0009 16.1434 17.071 17.071L15.657 15.657C16.4008 14.9147 16.9906 14.0329 17.3927 13.0621C17.7947 12.0913 18.0011 11.0507 18 9.99996C18 7.78996 17.105 5.78996 15.657 4.34296L17.071 2.92896Z" fill="#202020" />
              <path d="M7.172 7.17206C6.42181 7.92203 6.00023 8.93928 6 10.0001C6 11.1051 6.448 12.1041 7.172 12.8281L5.758 14.2421C5.19993 13.6857 4.75732 13.0245 4.45562 12.2965C4.15392 11.5685 3.99908 10.7881 4 10.0001C3.99908 9.21203 4.15392 8.43158 4.45562 7.70359C4.75732 6.9756 5.19993 6.31442 5.758 5.75806L7.172 7.17206ZM14.242 5.75806C14.8001 6.31442 15.2427 6.9756 15.5444 7.70359C15.8461 8.43158 16.0009 9.21203 16 10.0001C16.0009 10.7881 15.8461 11.5685 15.5444 12.2965C15.2427 13.0245 14.8001 13.6857 14.242 14.2421L12.828 12.8281C13.5782 12.0781 13.9998 11.0608 14 10.0001C13.9998 8.93928 13.5782 7.92203 12.828 7.17206L14.242 5.75806ZM10 8.00006C10.5304 8.00006 11.0391 8.21077 11.4142 8.58584C11.7893 8.96092 12 9.46962 12 10.0001C12 10.5305 11.7893 11.0392 11.4142 11.4143C11.0391 11.7893 10.5304 12.0001 10 12.0001C9.46957 12.0001 8.96086 11.7893 8.58579 11.4143C8.21072 11.0392 8 10.5305 8 10.0001C8 9.46962 8.21072 8.96092 8.58579 8.58584C8.96086 8.21077 9.46957 8.00006 10 8.00006Z" fill="#202020" />
            </svg>
            <p className="discover-live-badge-text">Live event</p>
          </div>
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
        <div className="discover-event-card-meta-container">
          <div className="discover-event-card-meta--date">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16" fill="none">
              <path d="M3 0V1.875H0V5.625H15V1.875H12V0H10.5V1.875H4.5V0H3ZM15 15.375V7.125H0V15.375H15Z" fill="#9CA3AF" />
            </svg>
            <p className="discover-event-card-meta">
              {item.date}
            </p>
          </div>
          <div className="discover-event-card-meta--location">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="19" viewBox="0 0 14 19" fill="none">
              <path d="M6.5625 0C2.93959 0 0 2.64592 0 5.90625C0 11.1562 6.5625 18.375 6.5625 18.375C6.5625 18.375 13.125 11.1562 13.125 5.90625C13.125 2.64592 10.1854 0 6.5625 0ZM6.5625 9.1875C6.04332 9.1875 5.53581 9.03355 5.10413 8.74511C4.67245 8.45667 4.336 8.0467 4.13732 7.56704C3.93864 7.08739 3.88665 6.55959 3.98794 6.05039C4.08922 5.54119 4.33923 5.07346 4.70634 4.70634C5.07346 4.33923 5.54119 4.08922 6.05039 3.98794C6.55959 3.88665 7.08739 3.93864 7.56704 4.13732C8.0467 4.336 8.45667 4.67245 8.74511 5.10413C9.03355 5.53581 9.1875 6.04332 9.1875 6.5625C9.18674 7.25846 8.90993 7.9257 8.41782 8.41782C7.9257 8.90993 7.25846 9.18674 6.5625 9.1875Z" fill="#9CA3AF" />
            </svg>
            <p className="discover-event-card-meta">
              {venueHref ? (
                <Link
                  to={venueHref}
                  className="discover-location-link event-location-link"
                  onClick={event => event.stopPropagation()}
                >
                  {item.location}
                </Link>
              ) : (
                <span className="discover-location-link discover-location-link--plain">{item.location}</span>
              )}
            </p>
          </div>
        </div>
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
        <div className="discover-place-card-content">
          {showFave && favoriteItemId && (
            <DiscoverFavoriteButton
              type="place"
              itemId={favoriteItemId}
              label={item.title}
              meta={faveMeta}
            />
          )}
          <div className="discover-place-card-header">
            <h3 className="discover-place-card-title">{item.title}</h3>
            <p className="discover-event-card-meta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span className="discover-location-link">{item.location}</span>
            </p>
          </div>
        </div>
        <Link to={discoverPlacePath(item.id)} className="discover-learn-more">
          Learn more
        </Link>
      </div>
    </article>
  );
}
