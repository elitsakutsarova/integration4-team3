import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import BackChevron from './BackChevron';
import DiscoverCategoryBadge from './discover/DiscoverCategoryBadge';
import { DiscoverFavoriteButton } from './discover/DiscoverFavoriteButton';
import DiscoverShareIcon from './discover/DiscoverShareIcon';
import DiscoverShareSuccess from './discover/DiscoverShareSuccess';
import ShareSheet from './diary/ShareSheet';
import FeaturedMemosSection from './memos/FeaturedMemosSection';
import { buildMemoArchiveHref } from '../utils/locationHref';
import { openDirectionsUrl } from '../utils/googleMaps';
import { goBack, paths } from '../utils/appPaths';
import { useDiscoverShare } from '../hooks/useDiscoverShare';
import { resolveLocationHeroImage } from '../utils/locationPhotoPlaceholders';
import { parsePhotonPlaceId } from '../utils/placeId';

function resolveCategoryBadge(categoryLabel) {
  switch (categoryLabel) {
    case 'Food':
      return 'food';
    case 'Art & Culture':
      return 'Art & culture';
    case 'Nightlife':
      return 'music';
    default:
      return 'Place';
  }
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

export default function LocationDetail({
  place,
  imageUrl: initialImageUrl = null,
  featuredMemos = [],
  totalMemoCount = 0,
}) {
  const navigate = useNavigate();
  const imageUrl = useDeferredPlaceImage(place.id, initialImageUrl);
  const heroImage = resolveLocationHeroImage(
    imageUrl,
    place.categoryLabel,
    place.osmKey,
    place.osmValue,
  );
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
  const favoriteMeta = {
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    categoryLabel: place.categoryLabel,
    address: place.address,
  };

  function handleBack() {
    goBack(navigate);
  }

  return (
    <>
      <div className="discover-detail-page">
        <div className="discover-detail-scroll">
          <div className="discover-detail-hero">
            <img
              src={heroImage}
              alt={`Photo of ${place.name}`}
              className="discover-detail-hero-img"
            />
            <div className="discover-detail-hero-wave">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 34" fill="none">
                <path d="M224.586 27.7321C149.578 28.3925 45.6965 -6.81931 0 13.681V34H393V0.0104169C329.722 -0.614372 299.594 27.0717 224.586 27.7321Z" fill="white" />
              </svg>
            </div>
            <div className="discover-detail-hero-nav">
              <BackChevron className="discover-detail-icon-btn discover-detail-back" onClick={handleBack} />
              <div className="discover-detail-hero-nav--circle">
                <button
                  type="button"
                  className="discover-detail-icon-btn discover-detail-share discover-detail-share--left discover-detail-share-btn"
                  onClick={openSheet}
                  aria-label="Share location"
                >
                  <DiscoverShareIcon />
                </button>

                <DiscoverFavoriteButton
                  type="place"
                  itemId={place.id}
                  label={place.name}
                  meta={favoriteMeta}
                  className="discover-detail-icon-btn discover-detail-fave"
                />
              </div>
            </div>
            <DiscoverCategoryBadge type={resolveCategoryBadge(place.categoryLabel)} />
          </div>

          <div className="discover-detail-body">
            <div className="discover-detail-title-container">
              <h1 className="discover-detail-title">{place.name}</h1>
            </div>

            {place.address && (
              <div className="discover-detail-address">
                <div className="discover-detail-info-card--icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="17" viewBox="0 0 14 19" fill="none">
                    <path d="M6.6625 0C2.98438 0 0 2.68624 0 5.99625C0 11.3262 6.6625 18.655 6.6625 18.655C6.6625 18.655 13.325 11.3262 13.325 5.99625C13.325 2.68624 10.3406 0 6.6625 0ZM6.6625 9.3275C6.13541 9.3275 5.62016 9.1712 5.18191 8.87837C4.74365 8.58553 4.40207 8.16932 4.20036 7.68235C3.99865 7.19539 3.94588 6.65954 4.04871 6.14258C4.15154 5.62562 4.40535 5.15077 4.77806 4.77806C5.15077 4.40535 5.62562 4.15154 6.14258 4.04871C6.65954 3.94588 7.19539 3.99865 7.68235 4.20036C8.16932 4.40207 8.58553 4.74365 8.87837 5.18191C9.1712 5.62016 9.3275 6.13541 9.3275 6.6625C9.32673 7.36906 9.0457 8.04647 8.54609 8.54609C8.04647 9.0457 7.36907 9.32673 6.6625 9.3275Z" fill="#202020" />
                  </svg>
                </div>
                <p className="discover-location-link">{place.address}</p>
              </div>
            )}

            <div className="discover-detail-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 19" fill="none">
                <path d="M169.089 15.4973C245.433 15.8664 351.164 -3.81079 397.675 7.64529V19H-2.32516V0.00582121C62.0799 -0.343326 92.7442 15.1283 169.089 15.4973Z" fill="#F1F4FF" />
              </svg>

              <section className="discover-detail-section" aria-labelledby="location-about">
                <h2 id="location-about" className="discover-detail-section-title">
                  <span className="discover-section-highlight" style={{ width: '4.5rem' }} aria-hidden="true" />
                  About
                </h2>
                <p className="discover-detail-about">{place.description}</p>
                {place.details.length > 0 && (
                  <ul className="discover-detail-facts">
                    {place.details.map(item => (
                      <li key={item.text}>
                        <span className="discover-detail-fact-emoji" aria-hidden="true">{item.emoji}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" fill="none">
                <path d="M171.848 20.6681C248.008 25.877 352.317 74.9139 399.365 54.82L398.966 14.4503L1.09783 -1.57932e-06L-0.000111769 39.3493C64.2114 45.1118 95.6875 15.4593 171.848 20.6681Z" fill="#F1F4FF" />
              </svg>
            </div>

            <Link
              to={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              reloadDocument
              className="discover-detail-cta"
              onClick={(event) => openDirectionsUrl(mapsUrl, event)}
            >
              Take me there
            </Link>

            <div className="discover-detail-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 19" fill="none">
                <path d="M169.089 15.4973C245.433 15.8664 351.164 -3.81079 397.675 7.64529V19H-2.32516V0.00582121C62.0799 -0.343326 92.7442 15.1283 169.089 15.4973Z" fill="#F1F4FF" />
              </svg>
              <FeaturedMemosSection
                memos={featuredMemos}
                totalMemoCount={totalMemoCount}
                archiveHref={archiveHref}
                layout="discover"
              />
            </div>

            <p className="location-detail-attribution">
              Place data ©{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
              {' '}contributors ·{' '}
              <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">ODbL</a>
            </p>
          </div>
        </div>
      </div>

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
    </>
  );
}
