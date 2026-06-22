// memo archive card — matches map memory-sheet polaroid style

import { Link } from 'react-router';
import MemoFavoriteButton from '../MemoFavoriteButton';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../../utils/googleMaps';

export default function MemoArchiveCard({ memo }) {
  const hasMedia = Boolean(memo.mediaPreview?.url);
  const canOpenMaps = Array.isArray(memo.ll) && memo.ll.length >= 2;

  return (
    <article className={`memory-sheet memory-sheet--archive${hasMedia ? '' : ' memory-sheet--text-only'}`}>
      {hasMedia && (
        <div className="memory-sheet-media-wrap">
          <div className="memory-sheet-image">
            {memo.mediaPreview.isVideo
              ? <video src={memo.mediaPreview.url} className="memory-sheet-preview-img" muted playsInline />
              : <img src={memo.mediaPreview.url} alt={`Memo photo from ${memo.location}`} className="memory-sheet-preview-img" />
            }
            <MemoFavoriteButton memoId={memo.id} label={memo.location} iconSize={20} />
            {(memo.tags ?? []).length > 0 && (
              <div className="memory-sheet-tags">
                {(memo.tags ?? []).map(tag => (
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
            <MemoFavoriteButton memoId={memo.id} label={memo.location} iconSize={20} />
            {(memo.tags ?? []).length > 0 && (
              <div className="memory-sheet-tags memory-sheet-tags--inline">
                {(memo.tags ?? []).map(tag => (
                  <span key={tag} className="memory-sheet-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="memory-sheet-quote">
          <span className="memory-sheet-quote-highlight">&ldquo;{memo.quote}&rdquo;</span>
        </p>

        <div className="memory-sheet-actions">
          <span className="memory-sheet-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="memory-sheet-location-name memory-sheet-location-name--plain">
              {memo.location}
            </span>
          </span>
          {canOpenMaps && (
            <Link
              to={buildGoogleMapsDirectionsUrl(memo.ll[0], memo.ll[1])}
              target="_blank"
              rel="noopener noreferrer"
              reloadDocument
              className="memory-sheet-cta"
              onClick={(event) => {
                event.stopPropagation();
                openGoogleMapsDirections(memo.ll[0], memo.ll[1], event);
              }}
            >
              Take me there
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
