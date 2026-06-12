// this component displays a memo card in the collection page

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSavedMemos } from '../../context/SavedMemosContext';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../../utils/googleMaps';
import { navigateToLocationDetail } from '../../utils/locationHref';
import { resolveNavigableLocationHref } from '../../utils/navigableLocation';

function MemoHeartButton({ memoId, label }) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const saved = isSaved(memoId);

  return (
    <button
      type="button"
      className={`collection-memo-heart${saved ? ' collection-memo-heart--saved' : ''}`}
      aria-label={saved ? `Remove ${label} from favourites` : `Save ${label} to favourites`}
      aria-pressed={saved}
      onClick={() => toggleMemo(memoId)}
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

export default function CollectionMemoCard({ memo, variant = 'favourite', showHeart = true }) {
  const navigate = useNavigate();
  const [locationHref, setLocationHref] = useState(null);
  const hasMedia = Boolean(memo.mediaPreview?.url);
  const canOpenMaps = Array.isArray(memo.ll) && memo.ll.length >= 2;

  useEffect(() => {
    let cancelled = false;

    void resolveNavigableLocationHref({
      placeId: memo.placeId,
      lat: memo.ll?.[0],
      lng: memo.ll?.[1],
      name: memo.location,
    }).then(href => {
      if (!cancelled) setLocationHref(href);
    });

    return () => {
      cancelled = true;
    };
  }, [memo]);

  function handleTakeMeThere(event) {
    event.stopPropagation();
    if (!canOpenMaps) {
      event.preventDefault();
      return;
    }
    openGoogleMapsDirections(memo.ll[0], memo.ll[1], event);
  }

  function handleLocationClick() {
    if (!locationHref) return;
    navigateToLocationDetail(navigate, locationHref);
  }

  return (
    <article className={`collection-memo-card${hasMedia ? '' : ' collection-memo-card--text-only'}`}>
      <div className="collection-memo-media">
        {hasMedia ? (
          memo.mediaPreview.isVideo
            ? <video src={memo.mediaPreview.url} className="collection-memo-img" muted playsInline />
            : <img src={memo.mediaPreview.url} alt="" className="collection-memo-img" />
        ) : (
          <div className="collection-memo-placeholder">
            {(memo.tags ?? []).slice(0, 1).map(tag => (
              <span key={tag} className="collection-memo-placeholder-tag">{tag}</span>
            ))}
            <span className="collection-memo-placeholder-label">Memo</span>
          </div>
        )}

        {showHeart && (
          <MemoHeartButton memoId={memo.id} label={memo.location} />
        )}

        {variant === 'created' && (
          <button type="button" className="collection-memo-edit" aria-label="Edit memo" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        )}

        {(memo.tags ?? []).length > 0 && hasMedia && (
          <div className="collection-memo-tags">
            {(memo.tags ?? []).map(tag => (
              <span key={tag} className="collection-memo-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="collection-memo-body">
        <p className="collection-memo-quote">&ldquo;{memo.quote}&rdquo;</p>

        <div className="collection-memo-actions">
          <span className="collection-memo-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {locationHref ? (
              <button type="button" className="collection-memo-location-link" onClick={handleLocationClick}>
                {memo.location}
              </button>
            ) : (
              <span className="collection-memo-location-text">{memo.location}</span>
            )}
          </span>

          {canOpenMaps && (
            <a
              href={buildGoogleMapsDirectionsUrl(memo.ll[0], memo.ll[1])}
              target="_blank"
              rel="noopener noreferrer"
              className="collection-memo-cta"
              onClick={handleTakeMeThere}
            >
              Take me there
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
