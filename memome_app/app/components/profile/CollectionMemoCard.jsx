// this component displays a memo card in the collection page

import { Link } from 'react-router';
import MemoFavoriteButton from '../MemoFavoriteButton';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../../utils/googleMaps';

export default function CollectionMemoCard({
  memo,
  showHeart = true,
}) {
  const locationHref = memo.locationHref ?? null;
  const hasMedia = Boolean(memo.mediaPreview?.url);
  const canOpenMaps = Array.isArray(memo.ll) && memo.ll.length >= 2;

  function handleTakeMeThere(event) {
    event.stopPropagation();
    if (!canOpenMaps) {
      event.preventDefault();
      return;
    }
    openGoogleMapsDirections(memo.ll[0], memo.ll[1], event);
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
          <MemoFavoriteButton
            memoId={memo.id}
            label={memo.location}
            className="collection-memo-heart"
            savedClassName=" collection-memo-heart--saved"
            iconSize={20}
          />
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
              <Link to={locationHref} className="collection-memo-location-link">
                {memo.location}
              </Link>
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
