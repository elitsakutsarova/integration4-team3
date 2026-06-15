import { Link } from 'react-router';
import { paths } from '../utils/appPaths';
import { addMemoAssets } from '../utils/addMemoAssets';

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  );
}

export default function GuestAddMemoLocked({ onClose }) {
  return (
    <div className="guest-add-memo-page" role="dialog" aria-labelledby="guest-add-memo-title" aria-modal="true">
      <div className="guest-add-memo-top">
        <div className="guest-add-memo-hero-deco" aria-hidden="true">
          <img className="guest-add-memo-top-grid" src={addMemoAssets.topGrid} alt="" />
        </div>

        <header className="guest-add-memo-header">
          <button
            type="button"
            className="guest-add-memo-back guest-add-memo-back--mobile"
            onClick={onClose}
            aria-label="Back to map"
          >
            <BackIcon />
          </button>
          <button
            type="button"
            className="guest-add-memo-back guest-add-memo-back--desktop"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <div className="guest-add-memo-title-bar">
            <h1 id="guest-add-memo-title" className="guest-add-memo-title">Add memo</h1>
          </div>
        </header>
      </div>

      <main className="guest-add-memo-main">
        <div className="guest-add-memo-content">
          <div className="guest-add-memo-stage" aria-hidden="true">
            <img className="guest-add-memo-star" src={addMemoAssets.star} alt="" />
            <img className="guest-add-memo-sticker-heart" src={addMemoAssets.stickerHeart} alt="" />
            <img className="guest-add-memo-sticker-smile" src={addMemoAssets.stickerSmile} alt="" />
            <img className="guest-add-memo-camera" src={addMemoAssets.camera} alt="" />
            <img className="guest-add-memo-sticker-burst" src={addMemoAssets.stickerBurst} alt="" />
            <img className="guest-add-memo-wave" src={addMemoAssets.wave} alt="" />
            <img className="guest-add-memo-grid-alt" src={addMemoAssets.topGridAlt} alt="" />
          </div>

          <div className="guest-add-memo-panel">
            <p className="guest-add-memo-panel-copy">
              Create account or log in to add memories
            </p>
            <Link to={paths.register} className="guest-add-memo-panel-btn">
              Create Account
            </Link>
            <p className="guest-add-memo-panel-login">
              Already have an account?{' '}
              <Link to={paths.login}>Log in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
