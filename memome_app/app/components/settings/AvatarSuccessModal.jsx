import { settingsAssets } from '../../utils/settingsAssets';

export default function AvatarSuccessModal({ onClose }) {
  return (
    <div
      className="avatar-success-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div
        className="avatar-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-success-title"
        aria-describedby="avatar-success-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="avatar-success-deco" aria-hidden="true">
          <img className="avatar-success-deco-wave" src={settingsAssets.vector533} alt="" />
          <img
            className="avatar-success-deco-grid avatar-success-deco-grid--left"
            src={settingsAssets.topGrid}
            alt=""
          />
          <img
            className="avatar-success-deco-grid avatar-success-deco-grid--right"
            src={settingsAssets.topGrid2}
            alt=""
          />
        </div>

        <h2 id="avatar-success-title" className="avatar-success-title">
          <span className="avatar-success-title-highlight" aria-hidden="true" />
          Success!
        </h2>
        <p id="avatar-success-desc" className="avatar-success-desc">
          Your profile picture was{' '}
          <span className="avatar-success-desc-highlight">successfully changed!</span>
        </p>
      </div>
    </div>
  );
}
