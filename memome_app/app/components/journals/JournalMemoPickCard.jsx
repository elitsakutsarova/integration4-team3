import MemorySheet from '../MemorySheet';

export default function JournalMemoPickCard({ memo, selected, onToggle }) {
  return (
    <article className={`created-memo-card journal-pick-card${selected ? ' journal-pick-card--selected' : ''}`}>
      <div className="journal-pick-card__center">
        <MemorySheet
          embedded
          responsiveScale
          hideToolbar
          pin={memo}
          locationHref={memo.locationHref ?? null}
          footerCta={{
            label: selected ? 'Unselect' : 'Select',
            onClick: onToggle,
            className: `memory-sheet-cta${selected ? ' memory-sheet-cta--selected' : ''}`,
          }}
        />
      </div>
    </article>
  );
}

export function JournalMemoMiniCard({
  memo,
  onRemove,
  selectable = false,
  selected = false,
  onSelect,
}) {
  const hasPhoto = Boolean(memo.mediaPreview?.url);

  const content = (
    <>
      <div className="journal-mini-card-visual">
        {hasPhoto ? (
          <div className="memory-sheet-media-wrap journal-mini-card-media">
            <div className="memory-sheet-image">
              <img src={memo.mediaPreview.url} alt={`Memo photo from ${memo.location}`} className="memory-sheet-preview-img" />
            </div>
          </div>
        ) : (
          <div className="journal-mini-card-text">
            <span className="memory-sheet-quote-highlight">{memo.quote}</span>
          </div>
        )}
        {hasPhoto && (
          <p className="journal-mini-card-quote">
            <span>{memo.quote}</span>
          </p>
        )}
      </div>
      <p className="journal-mini-card-location">{memo.location}</p>
    </>
  );

  if (selectable) {
    return (
      <article
        className={`journal-mini-card journal-mini-card--selectable${selected ? ' journal-mini-card--selected' : ''}`}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
      >
        {content}
      </article>
    );
  }

  return (
    <article className="journal-mini-card">
      <button
        type="button"
        className="journal-mini-card-remove"
        aria-label="Remove memo from journal"
        onClick={onRemove}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {content}
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export { CalendarIcon };
