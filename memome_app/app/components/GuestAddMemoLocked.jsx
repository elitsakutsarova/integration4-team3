import { addMemoAssets } from '../utils/addMemoAssets';
import GuestAuthCta from './GuestAuthCta';

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
      <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" stroke-width="2.5" />
    </svg>
  );
}

/* function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  );
} */

export default function GuestAddMemoLocked({ onClose }) {
  return (
    <div className="guest-add-memo-page" role="dialog" aria-labelledby="guest-add-memo-title" aria-modal="true">
      <div className="guest-add-memo-top">
        <div className="guest-add-memo-hero-deco" aria-hidden="true">
          <img
            className="guest-add-memo-hero-camera"
            src={addMemoAssets.camera}
            alt=""
          />
          <img
            className="guest-add-memo-hero-wave"
            src={addMemoAssets.lockedHeaderWave}
            alt=""
          />
          <img
            className="guest-add-memo-hero-pixel"
            src={addMemoAssets.lockedPixelDeco}
            alt=""
          />
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
          {/*          <button
            type="button"
            className="guest-add-memo-back guest-add-memo-back--desktop"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button> */}
          <div className="guest-add-memo-title-bar">
            <h1 id="guest-add-memo-title" className="guest-add-memo-title">Add memo</h1>
          </div>
        </header>
      </div>

      <main className="guest-add-memo-main">
        <div className="guest-add-memo-content">
          <div className="guest-add-memo-stage" aria-hidden="true">
            <img className="guest-add-memo-locked" src={addMemoAssets.locked} alt="" />
            {/* <img className="guest-add-memo-star" src={addMemoAssets.star} alt="" />
            <img className="guest-add-memo-sticker-heart" src={addMemoAssets.stickerHeart} alt="" />
            <img className="guest-add-memo-sticker-smile" src={addMemoAssets.stickerSmile} alt="" />
            <img className="guest-add-memo-lock" src={addMemoAssets.lock} alt="" />
            <img className="guest-add-memo-sticker-burst" src={addMemoAssets.stickerBurst} alt="" />
            <img className="guest-add-memo-wave" src={addMemoAssets.wave} alt="" />
            <img className="guest-add-memo-grid-alt" src={addMemoAssets.topGridAlt} alt="" /> */}
          </div>

          <div className="guest-add-memo-panel">
            <GuestAuthCta copy="Create account or log in to add memories" />
          </div>
        </div>
      </main>
    </div>
  );
}
