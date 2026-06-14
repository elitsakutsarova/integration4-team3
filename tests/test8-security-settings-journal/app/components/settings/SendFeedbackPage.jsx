import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { goBack, paths } from '../../utils/appPaths';
import { sendFeedbackAssets } from '../../utils/sendFeedbackAssets';
import { settingsAssets } from '../../utils/settingsAssets';

function AtIcon() {
  return <span className="feedback-at-symbol" aria-hidden="true">@</span>;
}

export default function SendFeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const emailPlaceholder = user?.username ?? 'alex_explores';

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
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
        ) : null}

        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-name">
              Name:
            </label>
            <div className="feedback-input-wrap">
              <input
                id="feedback-name"
                name="name"
                type="text"
                className="feedback-input"
                placeholder="Name"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-email">
              Email:
            </label>
            <div className="feedback-input-wrap">
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
              />
            </div>
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-subject">
              Subject:
            </label>
            <div className="feedback-input-wrap">
              <input
                id="feedback-subject"
                name="subject"
                type="text"
                className="feedback-input"
                placeholder="enter subject"
              />
            </div>
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="feedback-message">
              Message:
            </label>
            <div className="feedback-input-wrap feedback-input-wrap--textarea">
              <textarea
                id="feedback-message"
                name="message"
                className="feedback-textarea"
                placeholder="Enter message"
                rows={6}
              />
            </div>
          </div>

          <button type="submit" className="feedback-submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
