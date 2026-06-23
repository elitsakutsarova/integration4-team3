import { useId } from 'react';
import { createPortal } from 'react-dom';
import { useAutoDismissSuccess } from '../../hooks/useAutoDismissSuccess';
import { changeEmailAssets } from '../../utils/settingsAssets';

export default function SettingsChangeSuccessView({
  illustration,
  title = 'Success!',
  description,
  onDismiss,
}) {
  const titleId = useId();
  const descId = useId();

  useAutoDismissSuccess(onDismiss);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="change-email-success-backdrop"
      role="presentation"
      onClick={onDismiss}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss();
      }}
    >
      <div
        className="change-email-success-page"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="change-email-success-stack">
          <img
            className="change-email-success-illustration"
            src={illustration}
            alt=""
          />

          <div className="change-email-success-card">
            <div className="change-email-success-deco" aria-hidden="true">
              <img
                className="change-email-success-deco-doodle"
                src={changeEmailAssets.doodle}
                alt=""
              />
              <img
                className="change-email-success-deco-grid"
                src={changeEmailAssets.grid}
                alt=""
              />
            </div>

            <h2 id={titleId} className="change-email-success-title">
              {title}
            </h2>
            <p id={descId} className="change-email-success-desc">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
