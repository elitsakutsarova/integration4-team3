import { useNavigate } from 'react-router';
import BottomNav from './BottomNav';

function HeroMedia({ memos }) {
  const memoWithMedia = memos.find(m => m.mediaPreview?.url);
  if (memoWithMedia?.mediaPreview) {
    const { url, isVideo } = memoWithMedia.mediaPreview;
    return isVideo
      ? <video src={url} className="loc-detail-hero-img" controls playsInline />
      : <img src={url} alt="" className="loc-detail-hero-img" />;
  }

  return (
    <div className="loc-detail-hero-placeholder" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="400" y2="400" stroke="#d0d0d8" strokeWidth="2" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="#d0d0d8" strokeWidth="2" />
      </svg>
    </div>
  );
}

function FeaturedMemoCard({ memo }) {
  const hasMedia = Boolean(memo.mediaPreview?.url);

  return (
    <article className="loc-detail-memo-card">
      <div className="loc-detail-memo-media">
        {hasMedia ? (
          memo.mediaPreview.isVideo
            ? <video src={memo.mediaPreview.url} className="loc-detail-memo-img" muted playsInline />
            : <img src={memo.mediaPreview.url} alt="" className="loc-detail-memo-img" />
        ) : (
          <div className="loc-detail-memo-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        )}
      </div>
      <p className="loc-detail-memo-quote">&ldquo;{memo.quote}&rdquo;</p>
      {memo.date && <p className="loc-detail-memo-date">{memo.date}</p>}
    </article>
  );
}

export default function LocationDetail({ place, featuredMemos }) {
  const navigate = useNavigate();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  function handleShare() {
    const shareData = {
      title: place.name,
      text: place.description,
      url: window.location.href,
    };
    if (navigator.share) {
      void navigator.share(shareData);
      return;
    }
    void navigator.clipboard?.writeText(window.location.href);
  }

  return (
    <div className="loc-detail-page">
      <div className="loc-detail-scroll">
        <div className="loc-detail-hero">
          <HeroMedia memos={featuredMemos} />
          <button type="button" className="loc-detail-icon-btn loc-detail-back" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className="loc-detail-icon-btn loc-detail-share" onClick={handleShare} aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        <div className="loc-detail-body">
          <div className="loc-detail-title-row">
            <span className="loc-detail-category">{place.categoryLabel}</span>
            <button type="button" className="loc-detail-heart" aria-label="Save place">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <h1 className="loc-detail-name">{place.name}</h1>

          {place.address && (
            <p className="loc-detail-address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {place.address}
            </p>
          )}

          <hr className="loc-detail-divider" />

          <p className="loc-detail-description">{place.description}</p>

          {place.details.length > 0 && (
            <ul className="loc-detail-facts">
              {place.details.map(item => (
                <li key={item.text}>
                  <span className="loc-detail-fact-emoji" aria-hidden="true">{item.emoji}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          )}

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="loc-detail-cta">
            Take me there
          </a>

          <div className="loc-detail-memos-header">
            <h2 className="loc-detail-memos-title">Featured Memos</h2>
            <span className="loc-detail-memos-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
          </div>

          {featuredMemos.length > 0 ? (
            <div className="loc-detail-memos-grid">
              {featuredMemos.map(memo => (
                <FeaturedMemoCard key={memo.id} memo={memo} />
              ))}
            </div>
          ) : (
            <p className="loc-detail-memos-empty">No memos here yet. Be the first to share one!</p>
          )}

          <p className="loc-detail-attribution">
            Place data ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            {' '}contributors ·{' '}
            <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">ODbL</a>
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
