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

function PickCardFooter({ memo, selected, onToggle }) {
  return (
    <div className="journal-pick-sheet-actions">
      <span className="memory-sheet-location">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="memory-sheet-location-name memory-sheet-location-name--plain">
          {memo.location}
        </span>
      </span>
      <button
        type="button"
        className={`journal-pick-sheet-cta${selected ? ' journal-pick-sheet-cta--selected' : ''}`}
        onClick={onToggle}
      >
        {selected ? 'Unselect' : 'Select'}
      </button>
    </div>
  );
}

function PhotoPickCard({ memo, selected, onToggle }) {
  const tags = memo.tags ?? [];

  return (
    <article className={`journal-pick-sheet journal-pick-sheet--photo${selected ? ' journal-pick-sheet--selected' : ''}`}>
      <div className="journal-pick-sheet-visual">
        <div className="memory-sheet-media-wrap journal-pick-sheet-media-wrap">
          <div className="memory-sheet-image">
            {memo.mediaPreview.isVideo
              ? <video src={memo.mediaPreview.url} className="memory-sheet-preview-img" muted playsInline />
              : <img src={memo.mediaPreview.url} alt="" className="memory-sheet-preview-img" />
            }
            {tags.length > 0 && (
              <div className="memory-sheet-tags">
                {tags.map((tag) => (
                  <span key={tag} className="memory-sheet-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="journal-pick-sheet-quote">
          <span>{memo.quote}</span>
        </p>
      </div>
      <div className="journal-pick-sheet-footer">
        <PickCardFooter memo={memo} selected={selected} onToggle={onToggle} />
      </div>
    </article>
  );
}

function TextPickCard({ memo, selected, onToggle }) {
  const tags = memo.tags ?? [];

  return (
    <article className={`journal-pick-sheet journal-pick-sheet--text${selected ? ' journal-pick-sheet--selected' : ''}`}>
      <div className="journal-pick-sheet-body">
        <p className="memory-sheet-quote">
          <span className="memory-sheet-quote-highlight">{memo.quote}</span>
        </p>
        {tags.length > 0 && (
          <div className="memory-sheet-tags memory-sheet-tags--inline journal-pick-sheet-tags">
            {tags.map((tag) => (
              <span key={tag} className="memory-sheet-tag">{tag}</span>
            ))}
          </div>
        )}
        <PickCardFooter memo={memo} selected={selected} onToggle={onToggle} />
      </div>
    </article>
  );
}

export default function JournalMemoPickCard({ memo, selected, onToggle }) {
  const hasPhoto = Boolean(memo.mediaPreview?.url);

  if (hasPhoto) {
    return <PhotoPickCard memo={memo} selected={selected} onToggle={onToggle} />;
  }

  return <TextPickCard memo={memo} selected={selected} onToggle={onToggle} />;
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
              <img src={memo.mediaPreview.url} alt="" className="memory-sheet-preview-img" />
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

export { CalendarIcon };
