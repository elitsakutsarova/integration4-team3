// presentation/UI components for the discover page

import { Link } from 'react-router';
import { discoverEventPath, discoverPlacePath } from '../../utils/appPaths';
import { DiscoverFavoriteButton } from './DiscoverFavoriteButton';

export function CategoryIcon({ name }) {
  if (name === 'food') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9.8042 0H4.20979C1.8951 0 0.013986 2.58334 0.013986 4.90034C0.188483 4.90034 0.328671 4.9 0.713287 4.9H13.3007C13.6853 4.9 13.8248 4.90034 14 4.90034C14 2.58334 12.1189 0 9.8042 0ZM1.5035 3.5C1.81818 2.296 2.90909 1.4 4.20979 1.4H9.8042C11.1049 1.4 12.2028 2.296 12.5105 3.5H1.5035ZM13.3007 9.1H0.713287C0.328671 9.1 0.450721 9.10034 0.013986 9.10034C0.013986 11.4173 1.8951 14 4.20979 14H9.8042C12.1189 14 14 11.4173 14 9.10034C13.8248 9.10034 13.6853 9.1 13.3007 9.1ZM9.8042 12.6H4.20979C2.90909 12.6 1.81119 11.704 1.5035 10.5H12.5175C12.2028 11.704 11.1119 12.6 9.81119 12.6H9.8042ZM10.5035 5.6C9.38462 5.6 8.79021 6.076 8.32168 6.454C7.90909 6.783 7.63636 7 7.00699 7C6.37762 7 6.10489 6.783 5.69231 6.454C5.21678 6.076 4.62937 5.6 3.5035 5.6C2.37762 5.6 1.79021 6.076 1.31469 6.454C0.902098 6.783 0.629371 7 0 7V8.4C1.11888 8.4 1.71329 7.924 2.18881 7.546C2.6014 7.217 2.87413 7 3.5035 7C4.13287 7 4.40559 7.217 4.81818 7.546C5.29371 7.924 5.88112 8.4 7.00699 8.4C8.13287 8.4 8.72028 7.924 9.18881 7.546C9.6014 7.217 9.87413 7 10.4965 7C11.1189 7 11.3986 7.217 11.8042 7.546C12.2797 7.924 12.8671 8.4 13.986 8.4V7C13.3566 7 13.0839 6.783 12.6783 6.454C12.2028 6.076 11.6154 5.6 10.4965 5.6H10.5035Z" fill="#202020" />
      </svg>
    );
  }
  if (name === 'nightlife') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.33333 14V12.4444H6.22222V8.55556L0 1.55556V0H14V1.55556L7.77778 8.55556V12.4444H11.6667V14H2.33333ZM3.46111 3.11111H10.5389L11.9389 1.55556H2.06111L3.46111 3.11111ZM7 7.07778L9.15833 4.66667H4.84167L7 7.07778Z" fill="#202020" />
      </svg>
    );
  }
  if (name === 'fashion') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
        <path d="M12.4444 3.80952H10.8889C10.8889 1.67619 9.17778 0 7 0C4.82222 0 3.11111 1.67619 3.11111 3.80952H1.55556C0.7 3.80952 0.583333 3.80915 0 3.80915V16C0.875 16 0.7 16 1.55556 16H12.4444C13.3 16 13.4167 16 14 16V3.80952C12.5417 3.80915 13.3 3.80952 12.4444 3.80952ZM7 1.52381C8.32222 1.52381 9.33333 2.51429 9.33333 3.80952H4.66667C4.66667 2.51429 5.67778 1.52381 7 1.52381ZM12.4444 14.4762H1.55556V5.33333H12.4444V14.4762ZM7 8.38095C5.67778 8.38095 4.66667 7.39048 4.66667 6.09524H3.11111C3.11111 8.22857 4.82222 9.90476 7 9.90476C9.17778 9.90476 10.8889 8.22857 10.8889 6.09524H9.33333C9.33333 7.39048 8.32222 8.38095 7 8.38095Z" fill="#202020" />
      </svg>
    );
  }
  if (name === 'art') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 16C6.94942 16 5.90914 15.7931 4.93853 15.391C3.96793 14.989 3.08601 14.3997 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C12.4 0 16 3.2 16 7.2C16 8.47304 15.4943 9.69394 14.5941 10.5941C13.6939 11.4943 12.473 12 11.2 12H9.76C9.52 12 9.36 12.16 9.36 12.4C9.36 12.48 9.44 12.56 9.44 12.64C9.76 13.04 9.92 13.52 9.92 14C10 15.12 9.12 16 8 16ZM8 1.6C6.30261 1.6 4.67475 2.27428 3.47452 3.47452C2.27428 4.67475 1.6 6.30261 1.6 8C1.6 9.69739 2.27428 11.3253 3.47452 12.5255C4.67475 13.7257 6.30261 14.4 8 14.4C8.24 14.4 8.4 14.24 8.4 14C8.4 13.84 8.32 13.76 8.32 13.68C8 13.28 7.84 12.88 7.84 12.4C7.84 11.28 8.72 10.4 9.84 10.4H11.2C12.0487 10.4 12.8626 10.0629 13.4627 9.46274C14.0629 8.86263 14.4 8.04869 14.4 7.2C14.4 4.08 11.52 1.6 8 1.6ZM3.6 6.4L4.8 7.6L3.6 8.8L2.4 7.6L3.6 6.4ZM6 3.2L7.2 4.4L6 5.6L4.8 4.4L6 3.2ZM10 3.2L11.2 4.4L10 5.6L8.8 4.4L10 3.2ZM12.4 6.4L13.6 7.6L12.4 8.8L11.2 7.6L12.4 6.4Z" fill="#202020" />
      </svg>
    );
  }
  if (name === 'music') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" fill="none">
        <path d="M5.14286 9.36491V0H12V2.6668H6.85714V12.4451C6.85698 13.2278 6.60779 13.9885 6.14823 14.6094C5.68867 15.2303 5.04443 15.6765 4.3154 15.879C3.58637 16.0814 2.8133 16.0288 2.11607 15.7291C1.41885 15.4295 0.836437 14.8997 0.459154 14.2218C0.0818709 13.5439 -0.0691984 12.7559 0.0293744 11.9799C0.127947 11.2039 0.470654 10.4833 1.00435 9.92984C1.53804 9.37642 2.23289 9.02108 2.98115 8.91894C3.72941 8.8168 4.48926 8.97356 5.14286 9.36491Z" fill="black" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.77837 1.77831V14.2223H14.2224V1.77831H1.77837ZM0.000663554 1.77831C0.000663554 1.30683 0 0 0 0C0 0 1.3069 0.000599759 1.77837 0.000599759H14.2224C14.6938 0.000599759 16.0001 0.000599759 16.0001 0.000599759C16.0001 0.000599759 16.0001 1.30683 16.0001 1.77831V14.2223C16.0001 14.6938 16.0001 15.9994 16.0001 15.9994C16.0001 15.9994 14.6938 16 14.2224 16H1.77837C1.3069 16 0 15.9994 0 15.9994C0 15.9994 0.000663554 14.6938 0.000663554 14.2223V1.77831ZM8.00036 9.33358C8.00036 9.33358 8.4163 8.91638 8.66634 8.66634C8.91638 8.4163 9.33364 8.0003 9.33364 8.0003C9.33364 8.0003 8.91638 7.5831 8.66634 7.33306C8.4163 7.08302 8.00036 6.66702 8.00036 6.66702C8.00036 6.66702 7.5831 7.08302 7.33306 7.33306C7.08302 7.5831 6.66708 8.0003 6.66708 8.0003C6.66708 8.0003 7.08302 8.4163 7.33306 8.66634C7.5831 8.91638 8.00036 9.33358 8.00036 9.33358Z" fill="black" />
      <path d="M5.55535 5.55535C5.30531 5.80539 4.88937 6.22259 4.88937 6.22259L4.22207 5.55535L3.55609 4.8893C3.55609 4.8893 3.97203 4.4721 4.22207 4.22206C4.47211 3.97203 4.88937 3.55602 4.88937 3.55602L5.55535 4.22206L6.22265 4.8893C6.22265 4.8893 5.80539 5.30531 5.55535 5.55535Z" fill="black" />
      <path d="M11.7773 5.55535C11.5273 5.80539 11.1114 6.22259 11.1114 6.22259L10.4441 5.55535L9.77807 4.8893C9.77807 4.8893 10.194 4.4721 10.4441 4.22206C10.6941 3.97203 11.1114 3.55602 11.1114 3.55602L11.7773 4.22206L12.4446 4.8893C12.4446 4.8893 12.0274 5.30531 11.7773 5.55535Z" fill="black" />
      <path d="M11.7773 11.7773C11.5273 12.0274 11.1114 12.4446 11.1114 12.4446L10.4441 11.7773L9.77807 11.1113C9.77807 11.1113 10.194 10.6941 10.4441 10.4441C10.6941 10.194 11.1114 9.77801 11.1114 9.77801L11.7773 10.4441L12.4446 11.1113C12.4446 11.1113 12.0274 11.5273 11.7773 11.7773Z" fill="black" />
      <path d="M5.55535 11.7773C5.30531 12.0274 4.88937 12.4446 4.88937 12.4446L4.22206 11.7773L3.55609 11.1113C3.55609 11.1113 3.97203 10.6941 4.22206 10.4441C4.4721 10.194 4.88937 9.77801 4.88937 9.77801L5.55535 10.4441L6.22265 11.1113C6.22265 11.1113 5.80539 11.5273 5.55535 11.7773Z" fill="black" />
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
