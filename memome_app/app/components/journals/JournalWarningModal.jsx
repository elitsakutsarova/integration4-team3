import '../../styles/modules/warning-modal.css';
import { journalAssets } from '../../utils/journalAssets';

export default function JournalWarningModal({
  open,
  title,
  description,
  onClose,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryVariant = 'default',
}) {
  if (!open) return null;

  const secondaryClass = secondaryVariant === 'danger'
    ? 'create-journal-warning-discard create-journal-warning-discard--danger'
    : 'create-journal-warning-discard';

  return (
    <div
      className="create-journal-warning-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="create-journal-warning-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-warning-title"
        aria-describedby="journal-warning-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="create-journal-warning-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="create-journal-warning-deco" aria-hidden="true">
          <img
            className="create-journal-warning-deco-grid"
            src={journalAssets.warningGrid}
            alt="Decorative pixel grid background"
          />
          <img
            className="create-journal-warning-deco-wave"
            src={journalAssets.warningWave}
            alt="Decorative wave illustration"
          />
          <img
            className="create-journal-warning-deco-icon"
            src={journalAssets.warningIcon}
            alt="Warning illustration"
          />
        </div>

        <h2 id="journal-warning-title" className="create-journal-warning-title">
          {title}
        </h2>
        <p id="journal-warning-desc" className="create-journal-warning-desc">
          {description}
        </p>

        <div className="create-journal-warning-actions">
          {secondaryLabel && (
            <button type="button" className={secondaryClass} onClick={onSecondary}>
              {secondaryLabel}
            </button>
          )}
          <button type="button" className="create-journal-warning-continue" onClick={onPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
