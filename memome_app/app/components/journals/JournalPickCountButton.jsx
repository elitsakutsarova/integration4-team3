export default function JournalPickCountButton({
  countLabel,
  allVisibleSelected,
  onToggleSelectAll,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="create-journal-pick-count"
      aria-live="polite"
      aria-pressed={allVisibleSelected}
      aria-label={allVisibleSelected ? 'Deselect all memos on screen' : 'Select all memos on screen'}
      disabled={disabled}
      onClick={onToggleSelectAll}
    >
      <span
        className={`create-journal-pick-count-dot${allVisibleSelected ? ' create-journal-pick-count-dot--active' : ''}`}
        aria-hidden="true"
      />
      <span className="create-journal-pick-count-value">{countLabel}</span>
    </button>
  );
}
