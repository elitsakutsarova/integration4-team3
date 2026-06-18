// memory sheet component for the map view

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { useSavedMemos } from '../context/SavedMemosContext';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../utils/googleMaps';
import { paths } from '../utils/appPaths';

function MemoFavoriteButton({ memoId, label }) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const saved = isSaved(memoId);

  return (
    <button
      type="button"
      className={`memory-sheet-heart${saved ? ' memory-sheet-heart--saved' : ''}`}
      aria-label={saved ? `Remove ${label} from favourites` : `Save ${label} to favourites`}
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

function measurePlacement(anchor, sheet) {
  const rect = sheet.getBoundingClientRect();
  const margin = 12;
  const tailGap = 14;
  const halfW = rect.width / 2;

  const x = Math.min(
    Math.max(anchor.x, margin + halfW),
    window.innerWidth - margin - halfW,
  );

  const spaceAbove = anchor.y - margin;
  const spaceBelow = window.innerHeight - anchor.y - margin;
  const sheetH = rect.height + tailGap;
  const below = spaceAbove < sheetH && spaceBelow > spaceAbove;

  return { x, y: anchor.y, below };
}

export default function MemorySheet({ pin, anchor, onClose }) {
  const sheetRef = useRef(null);
  const [placement, setPlacement] = useState(null);
  const fetcher = useFetcher({ key: `location-href-${pin?.id}` });

  const locationHref = fetcher.data?.href ?? null;

  // Lazy-load navigable location link for the selected pin (keyed fetcher caches per id).
  useEffect(() => {
    if (!pin || fetcher.state !== 'idle' || fetcher.data !== undefined) return;
    const params = new URLSearchParams({
      placeId: pin.placeId ?? '',
      lat: String(pin.ll?.[0] ?? ''),
      lng: String(pin.ll?.[1] ?? ''),
      name: pin.location ?? '',
    });
    fetcher.load(`${paths.apiLocationHref}?${params}`);
    // fetcher is intentionally omitted — it is stable and its state is read inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.id]);

  useLayoutEffect(() => {
    if (!anchor || !sheetRef.current) {
      setPlacement(null);
      return;
    }

    setPlacement(measurePlacement(anchor, sheetRef.current));
  }, [anchor, pin, locationHref]);

  if (!pin || !anchor) return null;

  const hasMedia = Boolean(pin.mediaPreview?.url);
  const canOpenMaps = Array.isArray(pin.ll) && pin.ll.length >= 2;

  function handleTakeMeThere(event) {
    event.stopPropagation();
    if (!canOpenMaps) {
      event.preventDefault();
      return;
    }
    openGoogleMapsDirections(pin.ll[0], pin.ll[1], event);
  }

  const sheetStyle = placement
    ? {
        left: placement.x,
        top: placement.y,
        transform: placement.below
          ? 'translate(-50%, 14px)'
          : 'translate(-50%, calc(-100% - 14px))',
        visibility: 'visible',
      }
    : {
        left: anchor.x,
        top: anchor.y,
        transform: 'translate(-50%, calc(-100% - 14px))',
        visibility: 'hidden',
      };

  return (
    <div className="memory-sheet-backdrop memory-sheet-backdrop--anchored" onClick={onClose}>
      <article
        ref={sheetRef}
        className={`memory-sheet memory-sheet--anchored${hasMedia ? '' : ' memory-sheet--text-only'}${placement?.below ? ' memory-sheet--below' : ''}`}
        style={sheetStyle}
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
              {locationHref ? (
                <Link
                  to={locationHref}
                  className="memory-sheet-location-name"
                  onClick={onClose}
                >
                  {pin.location}
                </Link>
              ) : (
                <span className="memory-sheet-location-name memory-sheet-location-name--plain">
                  {pin.location}
                </span>
              )}
            </span>
            {canOpenMaps && (
              <a
                href={buildGoogleMapsDirectionsUrl(pin.ll[0], pin.ll[1])}
                target="_blank"
                rel="noopener noreferrer"
                className="memory-sheet-cta"
                onClick={handleTakeMeThere}
              >
                Take me there
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
