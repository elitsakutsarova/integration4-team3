import JournalMemoEntry from './JournalMemoEntry';

function MemoMenuButton({ onClick, label = 'Memo options' }) {
  return (
    <button
      type="button"
      className="edit-journal-memo-menu"
      aria-label={label}
      onClick={onClick}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
  );
}

export default function EditJournalMemoRow({
  memo,
  layout,
  selectMode = false,
  selected = false,
  onSelect,
  onMenuClick,
}) {
  function handleRowClick() {
    if (selectMode) onSelect?.();
  }

  return (
    <article
      className={`edit-journal-memo-row${selectMode ? ' edit-journal-memo-row--selectable' : ''}${selected ? ' edit-journal-memo-row--selected' : ''}`}
      onClick={selectMode ? handleRowClick : undefined}
      onKeyDown={selectMode ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.();
        }
      } : undefined}
      role={selectMode ? 'button' : undefined}
      tabIndex={selectMode ? 0 : undefined}
      aria-pressed={selectMode ? selected : undefined}
    >
      <JournalMemoEntry memo={memo} layout={layout} />
      {!selectMode && (
        <MemoMenuButton onClick={(event) => {
          event.stopPropagation();
          onMenuClick?.();
        }}
        />
      )}
    </article>
  );
}
