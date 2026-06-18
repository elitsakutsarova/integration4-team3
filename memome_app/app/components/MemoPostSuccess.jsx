import { memoPostSuccessAssets } from '../utils/memoPostSuccessAssets';

export default function MemoPostSuccess({ onClose }) {
  return (
    <div
      className="memo-post-success-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div
        className="memo-post-success-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-post-success-title"
        aria-describedby="memo-post-success-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className="memo-post-success-wave"
          src={memoPostSuccessAssets.waveLeft}
          alt=""
          aria-hidden="true"
        />
        <img
          className="memo-post-success-grid"
          src={memoPostSuccessAssets.gridRight}
          alt=""
          aria-hidden="true"
        />

        <div className="memo-post-success-hero" aria-hidden="true">
          <img
            className="memo-post-success-shadow"
            src={memoPostSuccessAssets.shadow}
            alt=""
          />
          <img
            className="memo-post-success-illustration"
            src={memoPostSuccessAssets.hero}
            alt=""
          />
        </div>

        <div className="memo-post-success-body">
          <h2 id="memo-post-success-title" className="memo-post-success-title">
            Success!
          </h2>
          <p id="memo-post-success-desc" className="memo-post-success-desc">
            Your memo was posted
          </p>
        </div>
      </div>
    </div>
  );
}
