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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
      <path d="M1 8.5H19M1 8.5V3.5H19V8.5M1 8.5V19.5H19V8.5M5 3.5V0M15 3.5V0" stroke="#797979" strokeWidth="2" />
    </svg>
  );
}

export { CalendarIcon };
