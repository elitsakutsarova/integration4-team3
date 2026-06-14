import { deleteWarningAssets } from '../../utils/deleteWarningAssets';

export default function DeleteAccountConfirmModal({ onCancel, onConfirm, busy = false }) {
  return (
    <div
      className="delete-account-backdrop"
      role="presentation"
      onClick={busy ? undefined : onCancel}
      onKeyDown={(event) => {
        if (!busy && event.key === 'Escape') onCancel();
      }}
    >
      <div
        className="delete-account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="delete-account-deco" aria-hidden="true">
          <img className="delete-account-deco-grid" src={deleteWarningAssets.pixelGrid} alt="" />
          <img className="delete-account-deco-wave" src={deleteWarningAssets.vector554} alt="" />
          <img className="delete-account-deco-shadow" src={deleteWarningAssets.ellipse73} alt="" />
          <img className="delete-account-deco-icon" src={deleteWarningAssets.deleteWarningIcon} alt="" />
        </div>

        <h2 id="delete-account-title" className="delete-account-title">
          You are about to{' '}
          <span className="delete-account-title-highlight">delete your account.</span>
        </h2>
        <p id="delete-account-desc" className="delete-account-desc">
          Are you sure you want to proceed? You cannot undo this action
        </p>

        <div className="delete-account-actions">
          <button
            type="button"
            className="delete-account-cancel"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-account-confirm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting…' : 'Yes, delete my account'}
          </button>
        </div>
      </div>
    </div>
  );
}
