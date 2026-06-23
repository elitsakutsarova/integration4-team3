import JournalMemoEntry from './JournalMemoEntry';

function MemoMenuButton({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  label = 'Drag to reorder memo',
}) {
  return (
    <button
      type="button"
      className="edit-journal-memo-menu"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={(event) => event.preventDefault()}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
  );
}

function MemoRemoveButton({ onClick, label = 'Remove memo from journal' }) {
  return (
    <button
      type="button"
      className="edit-journal-memo-remove"
      aria-label={label}
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M1.7 17L0 15.3L6.8 8.5L0 1.7L1.7 0L8.5 6.8L15.3 0L17 1.7L10.2 8.5L17 15.3L15.3 17L8.5 10.2L1.7 17Z" fill="#1952FF" />
      </svg>
    </button>
  );
}

export default function EditJournalMemoRow({
  memo,
  layout,
  active = false,
  dragging = false,
  dragOver = false,
  rowRef,
  onRowClick,
  onRemove,
  menuPointerHandlers,
}) {
  function handleRowClick() {
    onRowClick?.();
  }

  return (
    <article
      ref={rowRef}
      className={`edit-journal-memo-row${active ? ' edit-journal-memo-row--active' : ''}${dragging ? ' edit-journal-memo-row--dragging' : ''}${dragOver ? ' edit-journal-memo-row--drag-over' : ''}`}
      onClick={handleRowClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onRowClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={active}
    >
      <JournalMemoEntry memo={memo} layout={layout} />
      {active && (
        <MemoRemoveButton
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
        />
      )}
      <MemoMenuButton {...menuPointerHandlers} />
    </article>
  );
}
