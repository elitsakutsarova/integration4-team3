import { href, useLocation, useNavigate } from 'react-router';
import { useSavedMemos } from '../context/SavedMemosContext';
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
      const nameQ = pin.location
        ? `&name=${encodeURIComponent(pin.location)}`
        : '';
      return `${href('/location/:osmType/:osmId', parsed)}?lat=${latQ}&lng=${lngQ}${nameQ}`;
    }
  }

  if (isNamedVenueLocation(pin.location)) {
    return `/location?lat=${latQ}&lng=${lngQ}&name=${encodeURIComponent(pin.location)}`;
  }

  return null;
}

function MemoFavoriteButton({ memoId, label }) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const saved = isSaved(memoId);

  return (
    <button
      type="button"
      className={`memory-sheet-heart${saved ? ' memory-sheet-heart--saved' : ''}`}
      aria-label={saved ? `Remove ${label} from saved memos` : `Save ${label} to memos`}
      aria-pressed={saved}
      onClick={event => {
        event.stopPropagation();
        toggleMemo(memoId);
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="#1952ff"
          strokeWidth="1.8"
          fill={saved ? '#1952ff' : 'none'}
        />
      </svg>
    </button>
  );
}

export default function MemorySheet({ pin, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!pin) return null;

  const hasMedia = Boolean(pin.mediaPreview?.url);
  const detailHref = locationDetailHref(pin);

  function handleLocationClick(event) {
    event.stopPropagation();
    if (!detailHref) return;
    onClose();
    navigate(detailHref, {
      state: { returnTo: `${location.pathname}${location.search}` },
    });
  }

  return (
    <div className="memory-sheet-backdrop" onClick={onClose}>
      <article
        className={`memory-sheet${hasMedia ? '' : ' memory-sheet--text-only'}`}
        onClick={event => event.stopPropagation()}
      >
        {hasMedia && (
          <div className="memory-sheet-media-wrap">
            <div className="memory-sheet-image">
              {pin.mediaPreview.isVideo
                ? <video src={pin.mediaPreview.url} className="memory-sheet-preview-img" controls playsInline />
                : <img src={pin.mediaPreview.url} alt="" className="memory-sheet-preview-img" />
              }
              <MemoFavoriteButton memoId={pin.id} label={pin.location} />
              {(pin.tags ?? []).length > 0 && (
                <div className="memory-sheet-tags">
                  {(pin.tags ?? []).map(tag => (
                    <span key={tag} className="memory-sheet-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="memory-sheet-content">
          {!hasMedia && (
            <div className="memory-sheet-text-only-top">
              <MemoFavoriteButton memoId={pin.id} label={pin.location} />
              {(pin.tags ?? []).length > 0 && (
                <div className="memory-sheet-tags memory-sheet-tags--inline">
                  {(pin.tags ?? []).map(tag => (
                    <span key={tag} className="memory-sheet-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="memory-sheet-quote">
            <span className="memory-sheet-quote-highlight">&ldquo;{pin.quote}&rdquo;</span>
          </p>

          <div className="memory-sheet-actions">
            <span className="memory-sheet-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
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
              onClick={event => event.stopPropagation()}
            >
              Take me there
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
