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
