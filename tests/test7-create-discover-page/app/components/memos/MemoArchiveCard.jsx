// memo archive card — matches map memory-sheet polaroid style

import { useSavedMemos } from '../../context/SavedMemosContext';
import { openGoogleMapsDirections } from '../../utils/googleMaps';

function MemoFavoriteButton({ memoId, label }) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const saved = isSaved(memoId);

  return (
    <button
      type="button"
      className={`memory-sheet-heart${saved ? ' memory-sheet-heart--saved' : ''}`}
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

export default function MemoArchiveCard({ memo }) {
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
    <article className={`memory-sheet memory-sheet--archive${hasMedia ? '' : ' memory-sheet--text-only'}`}>
      {hasMedia && (
        <div className="memory-sheet-media-wrap">
          <div className="memory-sheet-image">
            {memo.mediaPreview.isVideo
              ? <video src={memo.mediaPreview.url} className="memory-sheet-preview-img" muted playsInline />
              : <img src={memo.mediaPreview.url} alt="" className="memory-sheet-preview-img" />
            }
            <MemoFavoriteButton memoId={memo.id} label={memo.location} />
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
            <MemoFavoriteButton memoId={memo.id} label={memo.location} />
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
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${memo.ll[0]},${memo.ll[1]}`}
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
  );
}
