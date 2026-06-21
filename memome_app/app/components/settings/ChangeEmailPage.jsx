// change e-mail page for account settings


import { useEffect, useState } from 'react';
import { Link, useFetcher, useNavigate, useRevalidator } from 'react-router';
import { EyeIcon, LockIcon, MailIcon } from '../auth/AuthIcons';
import { applySignedInUser, getAuthSnapshot } from '../../utils/authSession';
import { syncSessionProfile } from '../../utils/authStore';
import { accountErrorToFieldMap, validateAccountFormData } from '../../utils/accountFormValidation';
import { paths } from '../../utils/appPaths';
import { goBack } from '../../utils/appPaths';
import SettingsSubpageHeader from './SettingsSubpageHeader';
import { useAuth } from '../../context/AuthContext';
import { settingsAssets } from '../../utils/settingsAssets';

function mergeFieldErrors(clientErrors, fetcherData) {
  return { ...accountErrorToFieldMap(fetcherData?.error), ...clientErrors };
}

export default function ChangeEmailPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  const submitting = fetcher.state !== 'idle';
  const fieldErrors = mergeFieldErrors(clientErrors, fetcher.data);
  const formError = fieldErrors.form;

  // After email change succeeds: sync session, revalidate, return to account page.
  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'email') return;

    async function finishEmailChange() {
      if (fetcher.data.user) {
        const current = getAuthSnapshot().user;
        if (current) {
          applySignedInUser({ ...current, ...fetcher.data.user });
        }
        await syncSessionProfile();
      }
      revalidate();
      navigate(`${paths.profileSettingsAccount}?updated=email`, { replace: true });
    }

    void finishEmailChange();
  }, [fetcher.data, navigate]);

  function handleBack() {
    goBack(navigate, paths.profileSettingsAccount);
  }

  function handleSubmit(event) {
    const formData = new FormData(event.currentTarget);
    const validation = validateAccountFormData(formData, user);
    if (validation.error) {
      event.preventDefault();
      setClientErrors(accountErrorToFieldMap(validation.error));
      return;
    }
    setClientErrors({});
  }

  return (
    <div className="settings-page settings-form-page">
      <SettingsSubpageHeader
        title="Change e-mail"
        onBack={handleBack}
        backLabel="Back to account details"
        titleIcon={<img src={settingsAssets.changeIcon} alt="Change icon" />}
      />

      <div className="settings-form-body">
        <div className="settings-form-intro content-section-intro">
          <p className="settings-form-intro-title settings-section-title"><span class="settings-section-title-underline" aria-hidden="true"></span>Choose a new email</p>
          <p className="settings-form-intro-desc settings-section-text">
            Enter and confirm your new e-mail to change your old e-mail
          </p>
        </div>

        <fetcher.Form
          method="post"
          action={paths.apiAccount}
          className="settings-form"
          noValidate
          onSubmit={handleSubmit}
        >
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
                defaultValue={user?.email ?? ''}
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
                <EyeIcon off={!showPassword} />
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
