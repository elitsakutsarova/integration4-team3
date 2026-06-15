import { journalAssets } from '../../utils/journalAssets';

export default function CreateJournalWarningModal({ open, onContinue, onDiscard }) {
  if (!open) return null;

  return (
    <div
      className="create-journal-warning-backdrop"
      role="presentation"
      onClick={onContinue}
    >
      <div
        className="create-journal-warning-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-journal-warning-title"
        aria-describedby="create-journal-warning-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="create-journal-warning-close"
          aria-label="Continue editing"
          onClick={onContinue}
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
            alt=""
          />
          <img
            className="create-journal-warning-deco-wave"
            src={journalAssets.warningWave}
            alt=""
          />
          <img
            className="create-journal-warning-deco-icon"
            src={journalAssets.warningIcon}
            alt=""
          />
        </div>

        <h2 id="create-journal-warning-title" className="create-journal-warning-title">
          Are you sure you want to close this page without saving your journal?
        </h2>
        <p id="create-journal-warning-desc" className="create-journal-warning-desc">
          Your journal won&apos;t be saved
        </p>

        <div className="create-journal-warning-actions">
          <button type="button" className="create-journal-warning-discard" onClick={onDiscard}>
            Discard changes
          </button>
          <button type="button" className="create-journal-warning-continue" onClick={onContinue}>
            Continue editing
          </button>
        </div>
      </div>
    </div>
  );
}
