import { settingsAssets } from '../../utils/settingsAssets';

export default function LogoutConfirmModal({ onCancel, onConfirm }) {
  return (
    <div
      className="settings-logout-backdrop"
      role="presentation"
      onClick={onCancel}
      onKeyDown={event => {
        if (event.key === 'Escape') onCancel();
      }}
    >
      <div
        className="settings-logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-logout-title"
        aria-describedby="settings-logout-desc"
        onClick={event => event.stopPropagation()}
      >
        <div className="settings-logout-deco" aria-hidden="true">
          <img
            className="settings-logout-deco-grid"
            src={settingsAssets.pixelGrid}
            alt="Decorative pixel grid background"
          />
          <img
            className="settings-logout-deco-wave"
            src={settingsAssets.vector554}
            alt="Decorative wave illustration"
          />
          <img
            className="settings-logout-deco-star"
            src={settingsAssets.star21}
            alt="Decorative star illustration"
          />
          <img
            className="settings-logout-deco-shadow"
            src={settingsAssets.ellipse73}
            alt="Decorative shadow illustration"
          />
          <img
            className="settings-logout-deco-icon"
            src={settingsAssets.logoutGlyph}
            alt="Log out warning icon"
          />
        </div>

        <h2 id="settings-logout-title" className="settings-logout-title">
          Log out?
        </h2>
        <p id="settings-logout-desc" className="settings-logout-desc">
          Are you sure you want to log out of your account?
        </p>

        <div className="settings-logout-actions">
          <button type="button" className="settings-logout-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="settings-logout-confirm" onClick={onConfirm}>
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  );
}
