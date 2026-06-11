import { href, useNavigate } from 'react-router';
import { isNamedVenueLocation } from '../utils/locationHelpers';
import { isPhotonPlaceId, parsePhotonPlaceId } from '../utils/placeId';

function locationDetailHref(pin) {
  if (!Array.isArray(pin.ll) || pin.ll.length < 2) return null;

  const [lat, lng] = pin.ll;
  const latQ = encodeURIComponent(lat);
  const lngQ = encodeURIComponent(lng);

  if (isPhotonPlaceId(pin.placeId)) {
    const parsed = parsePhotonPlaceId(pin.placeId);
    if (parsed) {
      return `${href('/location/:osmType/:osmId', parsed)}?lat=${latQ}&lng=${lngQ}`;
    }
  }

  if (isNamedVenueLocation(pin.location)) {
    return `/location?lat=${latQ}&lng=${lngQ}&name=${encodeURIComponent(pin.location)}`;
  }

  return null;
}

export default function MemorySheet({ pin, onClose }) {
  const navigate = useNavigate();

  if (!pin) return null;

  const hasMedia = Boolean(pin.mediaPreview?.url);
  const detailHref = locationDetailHref(pin);

  function handleLocationClick(event) {
    event.stopPropagation();
    if (!detailHref) return;
    onClose();
    navigate(detailHref);
  }

  return (
    <div className="memory-sheet-backdrop" onClick={onClose}>
      <div className={`memory-sheet${hasMedia ? '' : ' memory-sheet--text-only'}`} onClick={e => e.stopPropagation()}>

        {hasMedia && (
          <div className="memory-sheet-image">
            {pin.mediaPreview.isVideo
              ? <video src={pin.mediaPreview.url} className="memory-sheet-preview-img" controls playsInline />
              : <img src={pin.mediaPreview.url} alt="Memory" className="memory-sheet-preview-img" />
            }
            <button type="button" className="memory-sheet-heart" aria-label="Save">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181F" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            {(pin.tags ?? []).length > 0 && (
              <div className="memory-sheet-tags">
                {(pin.tags ?? []).map(t => <span key={t} className="memory-sheet-tag">{t}</span>)}
              </div>
            )}
          </div>
        )}

        <div className="memory-sheet-content">
          {!hasMedia && (pin.tags ?? []).length > 0 && (
            <div className="memory-sheet-tags memory-sheet-tags--inline">
              {(pin.tags ?? []).map(t => <span key={t} className="memory-sheet-tag">{t}</span>)}
            </div>
          )}
          <p className="memory-sheet-quote">&ldquo;{pin.quote}&rdquo;</p>
          <div className="memory-sheet-actions">
            <span className="memory-sheet-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {detailHref ? (
                <button type="button" className="memory-sheet-location-name" onClick={handleLocationClick}>
                  {pin.location}
                </button>
              ) : (
                <span className="memory-sheet-location-name memory-sheet-location-name--plain">
                  {pin.location}
                </span>
              )}
            </span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pin.ll[0]},${pin.ll[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="memory-sheet-cta"
              onClick={e => e.stopPropagation()}
            >
              Take me there
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
