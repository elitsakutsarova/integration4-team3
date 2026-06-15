// featured memos section component for the location detail page

import { Link } from 'react-router';
import { useSavedMemos } from '../../context/SavedMemosContext';

function MemoSaveButton({ memoId, label, className = 'featured-memo-heart' }) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const saved = isSaved(memoId);

  return (
    <button
      type="button"
      className={`${className}${saved ? ' featured-memo-heart--saved' : ''}`}
      aria-label={saved ? `Remove ${label} from favourites` : `Save ${label} to favourites`}
      aria-pressed={saved}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        toggleMemo(memoId);
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export function FeaturedMemoPreviewCard({ memo, compact = true }) {
  const hasMedia = Boolean(memo.mediaPreview?.url);

  return (
    <article className={`featured-memo-card${compact ? ' featured-memo-card--compact' : ''}`}>
      <div className={`featured-memo-media${hasMedia ? '' : ' featured-memo-media--text'}`}>
        {hasMedia ? (
          memo.mediaPreview.isVideo
            ? <video src={memo.mediaPreview.url} className="featured-memo-image" muted playsInline />
            : <img src={memo.mediaPreview.url} alt="" className="featured-memo-image" />
        ) : (
          <p className="featured-memo-text-only">&ldquo;{memo.quote}&rdquo;</p>
        )}
        <MemoSaveButton memoId={memo.id} label={memo.location} />
        {hasMedia && (
          <p className="featured-memo-quote">
            <span className="featured-memo-quote-highlight">{memo.quote}</span>
          </p>
        )}
      </div>
      <p className="featured-memo-location">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span>{memo.location}</span>
      </p>
    </article>
  );
}

export default function FeaturedMemosSection({
  memos,
  totalMemoCount,
  archiveHref,
  title = 'Featured memos',
  layout = 'carousel',
  emptyMessage = 'No memos here yet. Be the first to share one!',
}) {
  const count = totalMemoCount ?? memos.length;
  const showViewMore = Boolean(archiveHref && count > 0);

  return (
    <section
      className={`featured-memos-section${layout === 'discover' ? ' discover-detail-section' : ''}`}
      aria-labelledby="featured-memos-heading"
    >
      <div className={`featured-memos-header${layout === 'discover' ? ' discover-detail-section-header' : ''}`}>
        <h2
          id="featured-memos-heading"
          className={`featured-memos-title${layout === 'discover' ? ' discover-detail-section-title' : ''}`}
        >
          {layout === 'discover' && (
            <span className="discover-section-highlight featured-memos-highlight" aria-hidden="true" />
          )}
          {title}
        </h2>
        {showViewMore && (
          <Link to={archiveHref} className="discover-view-all">
            View more
            <svg width="6" height="12" viewBox="0 0 6 12" fill="none" aria-hidden="true">
              <path d="M1 1l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
      </div>

      {memos.length > 0 ? (
        <div className={layout === 'grid' ? 'featured-memos-grid' : 'featured-memos-carousel'}>
          {memos.map(memo => (
            <FeaturedMemoPreviewCard key={memo.id} memo={memo} />
          ))}
        </div>
      ) : (
        <p className="featured-memos-empty">{emptyMessage}</p>
      )}
    </section>
  );
}
