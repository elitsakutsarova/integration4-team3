import { useFetcher, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { goBack, paths } from '../../utils/appPaths';
import { feedbackErrorToFieldMap } from '../../utils/submitFeedbackAction';
import { sendFeedbackAssets } from '../../utils/sendFeedbackAssets';
import { settingsAssets } from '../../utils/settingsAssets';

function AtIcon() {
  return <span className="feedback-at-symbol" aria-hidden="true">@</span>;
}

export default function SendFeedbackPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { user } = useAuth();

  const submitting = fetcher.state !== 'idle';
  const submitted = fetcher.data?.success === true;
  const fieldErrors = feedbackErrorToFieldMap(fetcher.data?.error);
  const formError = fieldErrors.form;
  const emailPlaceholder = user?.username ?? 'alex_explores';

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  return (
    <div className="settings-page feedback-page settings-form-page">
      <header className="settings-hero settings-hero--feedback">
        <div className="settings-hero-deco" aria-hidden="true">
          <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="" />
          <img className="feedback-hero-grid" src={sendFeedbackAssets.topGrid} alt="" />
          <img className="feedback-hero-wave" src={sendFeedbackAssets.vector551} alt="" />
          <img className="feedback-hero-icon" src={sendFeedbackAssets.sendFeedbackIcon} alt="" />
        </div>

        <div className="settings-title-row">
          <button
            type="button"
            className="settings-back-btn"
            onClick={handleBack}
            aria-label="Back to settings"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#1952ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="settings-title">
            <span className="settings-title-highlight settings-title-highlight--feedback" aria-hidden="true" />
            Send feedback
          </h1>
        </div>
      </header>

      <div className="settings-form-body feedback-content">
        <div className="settings-form-intro">
          <p className="settings-form-intro-title">Feedback form</p>
        </div>

        {submitted ? (
          <div className="feedback-success" role="status">
            Thanks for your feedback!
          </div>
        ) : (
        <>
          {formError ? (
            <p className="feedback-form-error" role="alert">
              {formError}
            </p>
          ) : null}

          <fetcher.Form
          method="post"
          action={paths.apiFeedback}
          className="feedback-form"
          noValidate
        >
          <input type="hidden" name="intent" value="submit-feedback" />

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-name">
              Name:
            </label>
            <div className={`feedback-input-wrap${fieldErrors.name ? ' feedback-input-wrap--error' : ''}`}>
              <input
                id="feedback-name"
                name="name"
                type="text"
                className="feedback-input"
                placeholder="Name"
                autoComplete="name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
              />
            </div>
            {fieldErrors.name ? (
              <p className="feedback-field-error">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-email">
              Email:
            </label>
            <div className={`feedback-input-wrap${fieldErrors.email ? ' feedback-input-wrap--error' : ''}`}>
              <span className="feedback-input-icon">
                <AtIcon />
              </span>
              <input
                id="feedback-email"
                name="email"
                type="email"
                className="feedback-input feedback-input--icon"
                placeholder={emailPlaceholder}
                defaultValue={user?.email ?? ''}
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </div>
            {fieldErrors.email ? (
              <p className="feedback-field-error">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-subject">
              Subject:
            </label>
            <div className={`feedback-input-wrap${fieldErrors.subject ? ' feedback-input-wrap--error' : ''}`}>
              <input
                id="feedback-subject"
                name="subject"
                type="text"
                className="feedback-input"
                placeholder="enter subject"
                required
                aria-invalid={Boolean(fieldErrors.subject)}
              />
            </div>
            {fieldErrors.subject ? (
              <p className="feedback-field-error">{fieldErrors.subject}</p>
            ) : null}
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-message">
              Message:
            </label>
            <div className={`feedback-input-wrap feedback-input-wrap--textarea${fieldErrors.message ? ' feedback-input-wrap--error' : ''}`}>
              <textarea
                id="feedback-message"
                name="message"
                className="feedback-textarea"
                placeholder="Enter message"
                rows={6}
                required
                aria-invalid={Boolean(fieldErrors.message)}
              />
            </div>
            {fieldErrors.message ? (
              <p className="feedback-field-error">{fieldErrors.message}</p>
            ) : null}
          </div>

          <button type="submit" className="feedback-submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit'}
          </button>
        </fetcher.Form>
        </>
        )}
      </div>
    </div>
  );
}
