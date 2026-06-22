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
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
          <path d="M1.7 17L0 15.3L6.8 8.5L0 1.7L1.7 0L8.5 6.8L15.3 0L17 1.7L10.2 8.5L17 15.3L15.3 17L8.5 10.2L1.7 17Z" fill="#1952FF" />
        </svg>
      </button>
      {content}
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
      <path d="M1 8.5H19M1 8.5V3.5H19V8.5M1 8.5V19.5H19V8.5M5 3.5V0M15 3.5V0" stroke="#797979" stroke-width="2" />
    </svg>
  );
}

export { CalendarIcon };
