import { Link, href, useNavigate } from 'react-router';
import BottomNav from '../BottomNav';
import { DiscoverFavoriteButton } from './DiscoverFavoriteButton';
import DiscoverSavedModal from './DiscoverSavedModal';
import { FEATURED_MEMOS } from '../../data/discoverDetails';

function CategoryBadge({ type }) {
  if (type === 'music') {
    return (
      <div className="discover-detail-badge discover-detail-badge--music" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l12-2v13" stroke="#1e1e1e" strokeWidth="2" />
          <circle cx="6" cy="18" r="3" fill="#1e1e1e" />
          <circle cx="18" cy="16" r="3" fill="#1e1e1e" />
        </svg>
      </div>
    );
  }
  if (type === 'food') {
    return (
      <div className="discover-detail-badge discover-detail-badge--food" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M3 11h18M3 15h18M6 7v14M12 7v14M18 7v14" stroke="#1e1e1e" strokeWidth="2" />
        </svg>
      </div>
    );
  }
  return (
    <div className="discover-detail-badge" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#1e1e1e" strokeWidth="2" />
      </svg>
    </div>
  );
}

function FeaturedMemoCard({ memo }) {
  return (
    <article className="discover-detail-memo-card">
      <div className="discover-detail-memo-media">
        <img src={memo.image} alt="" className="discover-detail-memo-image" />
        <button type="button" className="discover-detail-memo-heart" aria-label="Save memo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#1952ff" strokeWidth="1.8" />
          </svg>
        </button>
        <p className="discover-detail-memo-quote">
          <span className="discover-detail-memo-quote-highlight">{memo.quote}</span>
        </p>
      </div>
      <p className="discover-detail-memo-location">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span>{memo.location}</span>
      </p>
    </article>
  );
}

export default function EventDetailPage({ event }) {
  const navigate = useNavigate();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.mapsQuery)}`;

  return (
    <div className="discover-detail-page">
      <div className="discover-detail-scroll">
        <div className="discover-detail-hero">
          <img src={event.image} alt="" className="discover-detail-hero-img" />
          <div className="discover-detail-hero-wave" aria-hidden="true" />

          <button type="button" className="discover-detail-icon-btn discover-detail-back" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button type="button" className="discover-detail-icon-btn discover-detail-share discover-detail-share--left" aria-label="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" stroke="#1952ff" strokeWidth="2" />
              <polyline points="16 6 12 2 8 6" stroke="#1952ff" strokeWidth="2" />
              <line x1="12" y1="2" x2="12" y2="15" stroke="#1952ff" strokeWidth="2" />
            </svg>
          </button>

          <DiscoverFavoriteButton
            type="event"
            itemId={event.id}
            label={event.title}
            className="discover-detail-icon-btn discover-detail-fave"
          />

          <CategoryBadge type={event.categoryBadge} />
        </div>

        <div className="discover-detail-body">
          <h1 className="discover-detail-title">{event.title}</h1>

          <div className="discover-detail-info-row">
            <div className="discover-detail-info-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <div>
                <span className="discover-detail-info-label">Date &amp; time</span>
                <strong>{event.dateLabel}</strong>
                <span>{event.timeRange}</span>
              </div>
            </div>

            <div className="discover-detail-info-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <div>
                <span className="discover-detail-info-label">Venue</span>
                <strong>{event.venueName}</strong>
                <span className="discover-location-link">{event.venueAddress}</span>
              </div>
            </div>
          </div>

          <div className="discover-detail-wave-divider" aria-hidden="true">
            <svg viewBox="0 0 360 24" preserveAspectRatio="none">
              <path d="M0 12 C60 0, 120 24, 180 12 S300 0, 360 12" fill="none" stroke="#1952ff" strokeWidth="2" strokeDasharray="4 6" />
            </svg>
          </div>

          <section className="discover-detail-section" aria-labelledby="event-about">
            <h2 id="event-about" className="discover-detail-section-title">
              <span className="discover-section-highlight" style={{ width: '72px' }} aria-hidden="true" />
              About
            </h2>
            <p className="discover-detail-about">{event.about}</p>
            <button type="button" className="discover-detail-see-more">See more</button>
          </section>

          <a
            href={event.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="discover-detail-website-card"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V9z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <div>
              <span className="discover-detail-info-label">Official website</span>
              <strong>{event.websiteLabel}</strong>
              <span>Get your tickets on the official website.</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" />
              <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="discover-detail-cta">
            Take me there
          </a>

          <section className="discover-detail-section" aria-labelledby="event-memos">
            <div className="discover-detail-section-header">
              <h2 id="event-memos" className="discover-detail-section-title">
                <span className="discover-section-highlight" style={{ width: '160px' }} aria-hidden="true" />
                Featured memos
              </h2>
              <Link to={href('/discover')} className="discover-view-all">
                View all
                <svg width="6" height="12" viewBox="0 0 6 12" fill="none" aria-hidden="true">
                  <path d="M1 1l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="discover-detail-memo-carousel">
              {FEATURED_MEMOS.map(memo => (
                <FeaturedMemoCard key={memo.id} memo={memo} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <BottomNav />
      <DiscoverSavedModal />
    </div>
  );
}
