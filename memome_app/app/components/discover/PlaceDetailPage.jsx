// place detail page component for the discover page

import { useNavigate } from 'react-router';
import BackChevron from '../BackChevron';
import { DiscoverFavoriteButton } from './DiscoverFavoriteButton';
import DiscoverShareIcon from './DiscoverShareIcon';
import DiscoverShareSuccess from './DiscoverShareSuccess';
import ShareSheet from '../diary/ShareSheet';
import FeaturedMemosSection from '../memos/FeaturedMemosSection';
import { buildMemoArchiveHref } from '../../utils/locationHref';
import { useDiscoverShare } from '../../hooks/useDiscoverShare';

function CategoryBadge({ type }) {
  if (type === 'food') {
    return (
      <div className="discover-detail-badge discover-detail-badge--food" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M8 2v8M6 10h4M16 2c2 2 2 6 0 8-2 2-2 6 0 8" stroke="#1e1e1e" strokeWidth="2" />
        </svg>
      </div>
    );
  }
  return (
    <div className="discover-detail-badge" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M8 2v4M6 6h4M16 2v4M14 6h4M8 10v12M16 10v12" stroke="#1e1e1e" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function PlaceDetailPage({ place, featuredMemos = [], totalMemoCount = 0 }) {
  const navigate = useNavigate();
  const {
    showSheet,
    openSheet,
    closeSheet,
    showSuccess,
    closeSuccess,
    sharing,
    handleShare,
  } = useDiscoverShare({
    title: place.title,
    text: `Check out ${place.title} on MemMe`,
  });
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.mapsQuery)}`;
  const archiveHref = buildMemoArchiveHref({
    placeId: place.placeId,
    lat: place.ll?.[0],
    lng: place.ll?.[1],
    name: place.title ?? place.location,
    title: place.title,
  });

  return (
    <div className="discover-detail-page">
      <div className="discover-detail-scroll">
        <div className="discover-detail-hero discover-detail-hero--collage">
          <div className="discover-detail-collage">
            {place.collage.map((src, index) => (
              <img key={`${src}-${index}`} src={src} alt="" className="discover-detail-collage-img" />
            ))}
          </div>
          <div className="discover-detail-hero-wave" aria-hidden="true" />

          <BackChevron className="discover-detail-icon-btn discover-detail-back" onClick={() => navigate(-1)} />

          <button
            type="button"
            className="discover-detail-icon-btn discover-detail-share discover-detail-share--left discover-detail-share-btn"
            onClick={openSheet}
            aria-label="Share place"
          >
            <DiscoverShareIcon />
          </button>

          <DiscoverFavoriteButton
            type="place"
            itemId={place.id}
            label={place.title}
            className="discover-detail-icon-btn discover-detail-fave"
          />

          <CategoryBadge type={place.categoryBadge} />
        </div>

        <div className="discover-detail-body">
          <h1 className="discover-detail-title">{place.title}</h1>

          <p className="discover-detail-address">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="discover-location-link">{place.location}</span>
          </p>

          <div className="discover-detail-wave-divider" aria-hidden="true">
            <svg viewBox="0 0 360 24" preserveAspectRatio="none">
              <path d="M0 12 C60 0, 120 24, 180 12 S300 0, 360 12" fill="none" stroke="#1952ff" strokeWidth="2" strokeDasharray="4 6" />
            </svg>
          </div>

          <section className="discover-detail-section" aria-labelledby="place-about">
            <h2 id="place-about" className="discover-detail-section-title">
              <span className="discover-section-highlight" style={{ width: '72px' }} aria-hidden="true" />
              About
            </h2>
            <p className="discover-detail-about">{place.about}</p>
            <ul className="discover-detail-facts">
              {place.facts.map(fact => (
                <li key={fact.text}>
                  <span className="discover-detail-fact-emoji" aria-hidden="true">{fact.emoji}</span>
                  {fact.text}
                </li>
              ))}
            </ul>
          </section>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="discover-detail-cta">
            Take me there
          </a>

          <FeaturedMemosSection
            memos={featuredMemos}
            totalMemoCount={totalMemoCount}
            archiveHref={archiveHref}
            layout="discover"
          />
        </div>
      </div>

      {showSheet && (
        <ShareSheet
          title="Share place"
          countLabel={place.title}
          onClose={closeSheet}
          onShareApp={handleShare}
          onShareContact={handleShare}
          disabled={sharing}
        />
      )}

      {showSuccess && (
        <DiscoverShareSuccess variant="place" onClose={closeSuccess} />
      )}
    </div>
  );
}
