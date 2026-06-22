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
      <span aria-hidden="true">-</span>
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
