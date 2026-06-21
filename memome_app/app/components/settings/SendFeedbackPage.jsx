// settings page for sending feedback to us through Subapase

import { useFetcher, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { goBack, paths } from '../../utils/appPaths';
import { SettingsBackButton } from './SettingsSubpageHeader';
import { feedbackErrorToFieldMap } from '../../utils/submitFeedbackAction';
import { sendFeedbackAssets } from '../../utils/sendFeedbackAssets';
import { settingsAssets } from '../../utils/settingsAssets';
import SettingsSubpageHeader from './SettingsSubpageHeader';

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
  const usernamePlaceholder = user?.username ? `${user.username}` : 'Type your username here';
  const emailPlaceholder = 'Type your email here';

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  return (
    <div className="settings-page feedback-page settings-form-page">
      <SettingsSubpageHeader
              title="Send feedback"
              onBack={handleBack}
              backLabel="Back to settings"
              titleIcon={<img src={settingsAssets.supportIcon} alt="Star shape looking like gear" />}
            />

      <div className="settings-form-body feedback-content">
        <div className="settings-form-intro">
          <h2 className="settings-form-intro-title"><span class="settings-form-intro-title-underline" aria-hidden="true"></span>We’d love to hear from you</h2>
          <p className="settings-form-intro-text">
            Need help or have an idea? Send us your feedback so we can make MemoMe better.
          </p>
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
              Username:
            </label>
            <div className={`feedback-input-wrap${fieldErrors.name ? ' feedback-input-wrap--error' : ''}`}>
              <input
                id="feedback-name"
                name="name"
                type="text"
                className="feedback-input"
                      placeholder={usernamePlaceholder}
                      defaultValue={user?.username ?? ''}
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
{/*               <span className="feedback-input-icon">
                <AtIcon />
              </span> */}
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
                      placeholder="Give a title to your message"
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
                      placeholder="Type your message here"
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
