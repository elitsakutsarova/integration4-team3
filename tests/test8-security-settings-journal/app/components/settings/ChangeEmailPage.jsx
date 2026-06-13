import { useEffect, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { EyeIcon, LockIcon, MailIcon } from '../auth/AuthIcons';
import { applySignedInUser, getAuthSnapshot } from '../../utils/authSession';
import { paths } from '../../utils/appPaths';
import { goBack } from '../../utils/navigationBack';
import { revalidateApp } from '../../utils/revalidateApp';
import SettingsSubpageHeader from './SettingsSubpageHeader';

function fieldErrorsFromAction(data) {
  if (!data?.error) return {};
  const { field, message } = data.error;
  return field ? { [field]: message } : { form: message };
}

export default function ChangeEmailPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [showPassword, setShowPassword] = useState(false);

  const submitting = fetcher.state !== 'idle';
  const fieldErrors = fieldErrorsFromAction(fetcher.data);
  const formError = fieldErrors.form;

  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'email') return;

    if (fetcher.data.user?.email) {
      const current = getAuthSnapshot().user;
      if (current) {
        applySignedInUser({ ...current, email: fetcher.data.user.email });
      }
    }
    revalidateApp();

    const updated = fetcher.data.pendingConfirmation ? 'email-pending' : 'email';
    navigate(`${paths.profileSettingsAccount}?updated=${updated}`, { replace: true });
  }, [fetcher.data, navigate]);

  function handleBack() {
    goBack(navigate, paths.profileSettingsAccount);
  }

  function handleCancel() {
    navigate(paths.profileSettingsAccount);
  }

  return (
    <div className="settings-page settings-form-page">
      <SettingsSubpageHeader
        title="Change e-mail"
        onBack={handleBack}
        backLabel="Back to account details"
      />

      <div className="settings-form-body">
        <div className="settings-form-intro">
          <p className="settings-form-intro-title">Choose a new email</p>
          <p className="settings-form-intro-desc">
            Enter and confirm your new e-mail to change your old e-mail
          </p>
        </div>

        <fetcher.Form method="post" action={paths.apiAccount} className="settings-form" noValidate>
          <input type="hidden" name="intent" value="change-email" />

          <div className="auth-field">
            <label className="auth-label" htmlFor="old-email">Old e-mail</label>
            <div className={`auth-input-wrap${fieldErrors.oldEmail ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><MailIcon /></span>
              <input
                id="old-email"
                name="oldEmail"
                type="email"
                className="auth-input auth-input--icon"
                placeholder="Enter your old e-mail"
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.oldEmail)}
              />
            </div>
            {fieldErrors.oldEmail ? (
              <p className="auth-field-error">{fieldErrors.oldEmail}</p>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="new-email">New e-mail</label>
            <div className={`auth-input-wrap${fieldErrors.newEmail ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><MailIcon /></span>
              <input
                id="new-email"
                name="newEmail"
                type="email"
                className="auth-input auth-input--icon"
                placeholder="Enter your new e-mail"
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.newEmail)}
              />
            </div>
            {fieldErrors.newEmail ? (
              <p className="auth-field-error">{fieldErrors.newEmail}</p>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm-password">Confirm password</label>
            <div className={`auth-input-wrap${fieldErrors.password ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="confirm-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon auth-input--password"
                placeholder="Confirm your password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="auth-field-error">{fieldErrors.password}</p>
            ) : null}
          </div>

          {formError ? (
            <div className="auth-banner auth-banner--warning" role="alert">
              {formError}
            </div>
          ) : null}

          <div className="settings-form-actions">
            <button
              type="button"
              className="settings-form-btn settings-form-btn--cancel"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="settings-form-btn settings-form-btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Change e-mail'}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
