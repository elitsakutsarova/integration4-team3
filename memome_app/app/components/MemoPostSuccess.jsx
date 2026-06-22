import { memoPostSuccessAssets } from '../utils/memoPostSuccessAssets';

export default function MemoPostSuccess({
  description = 'Your memo was posted',
  onClose,
  dismissible = true,
}) {
  return (
    <div
      className="memo-post-success-backdrop"
      role="presentation"
      onClick={dismissible ? onClose : undefined}
      onKeyDown={(event) => {
        if (dismissible && event.key === 'Escape') onClose?.();
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
          alt="Decorative wave illustration"
          aria-hidden="true"
        />
        <img
          className="memo-post-success-grid"
          src={memoPostSuccessAssets.gridRight}
          alt="Decorative pixel grid background"
          aria-hidden="true"
        />

        <div className="memo-post-success-hero" aria-hidden="true">
          <img
            className="memo-post-success-illustration"
            src={memoPostSuccessAssets.hero}
            alt="Success celebration illustration"
          />
        </div>

        <div className="memo-post-success-body">
          <h2 id="memo-post-success-title" className="memo-post-success-title">
            Success!
          </h2>
          <p id="memo-post-success-desc" className="memo-post-success-desc">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
