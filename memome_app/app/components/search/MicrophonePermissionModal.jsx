import '../../styles/modules/warning-modal.css';

export default function MicrophonePermissionModal({ open, onClose }) {
  if (!open) return null;

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
        aria-labelledby="mic-permission-title"
        aria-describedby="mic-permission-desc"
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

        <h2 id="mic-permission-title" className="create-journal-warning-title">
          Allow microphone access
        </h2>
        <p id="mic-permission-desc" className="create-journal-warning-desc">
          Voice search needs your microphone. Allow access in your browser when prompted, or enable
          the microphone for this site in your browser settings and try again.
        </p>

        <div className="create-journal-warning-actions">
          <button type="button" className="create-journal-warning-continue" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
