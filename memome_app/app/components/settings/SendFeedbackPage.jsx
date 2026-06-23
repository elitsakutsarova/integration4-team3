// settings page for sending feedback to us through Subapase

import { useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { goBack, paths } from '../../utils/appPaths';
import { feedbackErrorToFieldMap } from '../../utils/submitFeedbackAction';
import { changeEmailAssets, settingsAssets } from '../../utils/settingsAssets';
import SettingsChangeSuccessView from './SettingsChangeSuccessView';
import SettingsSubpageHeader from './SettingsSubpageHeader';

const FEEDBACK_SUCCESS_TITLE = 'Thank you for your message!';
const FEEDBACK_SUCCESS_DESC =
  'We usually reply in under 24 hours so keep an eye on your e-mail inbox.';

export default function SendFeedbackPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { user } = useAuth();
  const finishHandledRef = useRef(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const submitting = fetcher.state !== 'idle';
  const fieldErrors = feedbackErrorToFieldMap(fetcher.data?.error);
  const formError = fieldErrors.form;
  const usernamePlaceholder = user?.username ? `${user.username}` : 'Type your username here';
  const emailPlaceholder = 'Type your email here';
  const [formValues, setFormValues] = useState({
    name: user?.username ?? '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  });

  const canSubmit = Object.values(formValues).every((value) => value.trim());

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      finishHandledRef.current = false;
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || fetcher.data?.success !== true) return;
    if (finishHandledRef.current) return;
    finishHandledRef.current = true;
    setSuccessOpen(true);
  }, [fetcher.state, fetcher.data]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleBack() {
    goBack(navigate, paths.profileSettingsSupport);
  }

  function dismissSuccess() {
    setSuccessOpen(false);
    goBack(navigate, paths.profileSettingsSupport);
  }

  return (
    <div className="settings-page feedback-page settings-form-page">
      <SettingsSubpageHeader
        title="Send feedback"
        onBack={handleBack}
        backLabel="Back to support"
        titleIcon={<img src={settingsAssets.supportIcon} alt="Star shape looking like gear" />}
      />

      <div className="settings-form-body feedback-content">
        <div className="settings-form-intro">
          <h2 className="settings-form-intro-title"><span className="settings-form-intro-title-underline" aria-hidden="true"></span>We’d love to hear from you</h2>
          <p className="settings-form-intro-text">
            Need help or have an idea? Send us your feedback so we can make MemoMe better.
          </p>
        </div>

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
                value={formValues.name}
                onChange={handleFieldChange}
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
              <input
                id="feedback-email"
                name="email"
                type="email"
                className="feedback-input feedback-input--icon"
                placeholder={emailPlaceholder}
                value={formValues.email}
                onChange={handleFieldChange}
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
                value={formValues.subject}
                onChange={handleFieldChange}
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
                value={formValues.message}
                onChange={handleFieldChange}
                required
                aria-invalid={Boolean(fieldErrors.message)}
              />
            </div>
            {fieldErrors.message ? (
              <p className="feedback-field-error">{fieldErrors.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className={`feedback-submit${canSubmit ? ' feedback-submit--active' : ''}`}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Sending…' : 'Submit'}
          </button>
        </fetcher.Form>
      </div>

      {successOpen ? (
        <SettingsChangeSuccessView
          illustration={changeEmailAssets.illustration}
          title={FEEDBACK_SUCCESS_TITLE}
          description={FEEDBACK_SUCCESS_DESC}
          onDismiss={dismissSuccess}
        />
      ) : null}
    </div>
  );
}
