import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from './BottomNav';
import DiscoverShareIcon from './discover/DiscoverShareIcon';
import DiscoverShareSuccess from './discover/DiscoverShareSuccess';
import ShareSheet from './diary/ShareSheet';
import FeaturedMemosSection from './memos/FeaturedMemosSection';
import { buildMemoArchiveHref } from '../utils/locationHref';
import { goBack, paths } from '../utils/appPaths';
import { useDiscoverShare } from '../hooks/useDiscoverShare';
import { parsePhotonPlaceId } from '../utils/placeId';

function HeroMedia({ imageUrl, placeName, categoryLabel }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={placeName ? `${placeName} exterior` : 'Venue photo'}
        className="loc-detail-hero-img"
      />
    );
  }

  return (
    <div className="loc-detail-hero-placeholder" aria-hidden="true">
      <span className="loc-detail-hero-placeholder-label">{categoryLabel || 'Place'}</span>
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="400" y2="400" stroke="#d0d0d8" strokeWidth="2" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="#d0d0d8" strokeWidth="2" />
      </svg>
    </div>
  );
}

function useDeferredPlaceImage(placeId, initialUrl) {
  const [imageUrl, setImageUrl] = useState(initialUrl);

  useEffect(() => {
    if (initialUrl || !placeId) return;

    const parsed = parsePhotonPlaceId(placeId);
    if (!parsed) return;

    const params = new URLSearchParams({
      osmType: parsed.osmType,
      osmId: parsed.osmId,
    });

    let cancelled = false;

    fetch(`${paths.apiPlaceImage}?${params}`)
      .then(response => (response.ok ? response.json() : null))
      .then(payload => {
        if (!cancelled && payload?.imageUrl) {
          setImageUrl(payload.imageUrl);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [placeId, initialUrl]);

  return imageUrl;
}

export default function LocationDetail({ place, imageUrl: initialImageUrl = null, featuredMemos = [], totalMemoCount = 0 }) {
  const navigate = useNavigate();
  const imageUrl = useDeferredPlaceImage(place.id, initialImageUrl);
  const {
    showSheet,
    openSheet,
    closeSheet,
    showSuccess,
    closeSuccess,
    sharing,
    handleShare,
  } = useDiscoverShare(() => ({
    title: place.name,
    text: place.description || `Check out ${place.name} on MemMe`,
  }));
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const archiveHref = buildMemoArchiveHref({
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
    name: place.name,
    title: place.name,
  });

  function handleBack() {
    goBack(navigate);
  }

  return (
    <div className="loc-detail-page">
      <div className="loc-detail-scroll">
        <div className="loc-detail-hero">
          <HeroMedia
            imageUrl={imageUrl}
            placeName={place.name}
            categoryLabel={place.categoryLabel}
          />
          <button type="button" className="loc-detail-icon-btn loc-detail-back" onClick={handleBack} aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
              <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" stroke-width="2.5" />
            </svg>
          </button>
          <button
            type="button"
            className="loc-detail-icon-btn loc-detail-share loc-detail-share-btn"
            onClick={openSheet}
            aria-label="Share location"
          >
            <DiscoverShareIcon />
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

          <FeaturedMemosSection
            memos={featuredMemos}
            totalMemoCount={totalMemoCount}
            archiveHref={archiveHref}
            title="Featured Memos"
            layout="grid"
          />

          <p className="loc-detail-attribution">
            Place data ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            {' '}contributors ·{' '}
            <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">ODbL</a>
          </p>
        </div>
      </div>

      <BottomNav />

      {showSheet && (
        <ShareSheet
          title="Share location"
          countLabel={place.name}
          onClose={closeSheet}
          onShareApp={handleShare}
          onShareContact={handleShare}
          disabled={sharing}
        />
      )}

      {showSuccess && (
        <DiscoverShareSuccess variant="location" onClose={closeSuccess} />
      )}
    </div>
  );
}
