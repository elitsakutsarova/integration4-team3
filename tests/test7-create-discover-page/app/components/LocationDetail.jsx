import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from './BottomNav';
import FeaturedMemosSection from './memos/FeaturedMemosSection';
import { buildMemoArchiveHref } from '../utils/locationHref';
import { goBack } from '../utils/navigationBack';
import { fetchPhotonPlaceDetail, resolvePhotonPoiAt } from '../utils/locationPhoton';
import { fetchPlaceImageUrl } from '../utils/placeImage';
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

export default function LocationDetail({ place: initialPlace, featuredMemos = [], totalMemoCount = 0 }) {
  const navigate = useNavigate();
  const [place, setPlace] = useState(initialPlace);
  const [imageUrl, setImageUrl] = useState(null);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const archiveHref = buildMemoArchiveHref({
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
    name: place.name,
    title: place.name,
  });

  useEffect(() => {
    setPlace(initialPlace);
    setImageUrl(null);
  }, [initialPlace]);

  useEffect(() => {
    let cancelled = false;

    const photonPromise = initialPlace.id
      ? fetchPhotonPlaceDetail({
        lat: initialPlace.lat,
        lng: initialPlace.lng,
        placeId: initialPlace.id,
      })
      : resolvePhotonPoiAt({
        lat: initialPlace.lat,
        lng: initialPlace.lng,
        name: initialPlace.name,
      });

    void photonPromise.then(enriched => {
      if (!cancelled && enriched) setPlace(enriched);
    });

    return () => {
      cancelled = true;
    };
  }, [initialPlace.id, initialPlace.lat, initialPlace.lng, initialPlace.name]);

  useEffect(() => {
    const parsed = parsePhotonPlaceId(place.id);
    if (!parsed) return undefined;

    let cancelled = false;
    void fetchPlaceImageUrl(parsed).then(url => {
      if (!cancelled && url) setImageUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [place.id]);

  function handleBack() {
    goBack(navigate, '/');
  }

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
          <HeroMedia
            imageUrl={imageUrl}
            placeName={place.name}
            categoryLabel={place.categoryLabel}
          />
          <button type="button" className="loc-detail-icon-btn loc-detail-back" onClick={handleBack} aria-label="Back">
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
    </div>
  );
}
