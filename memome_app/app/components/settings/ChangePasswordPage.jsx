// change password page for account settings

import { useEffect, useState } from 'react';
import { Link, useFetcher, useNavigate, useRevalidator } from 'react-router';
import { EyeIcon, LockIcon } from '../auth/AuthIcons';
import { accountErrorToFieldMap, validateAccountFormData } from '../../utils/accountFormValidation';
import SettingsSubpageHeader from './SettingsSubpageHeader';
import PasswordStrengthFeedback from './PasswordStrengthFeedback';
import { goBack, paths } from '../../utils/appPaths';
import { syncSessionProfile } from '../../utils/authStore';
import { settingsAssets } from '../../utils/settingsAssets';

function mergeFieldErrors(clientErrors, fetcherData) {
  return { ...accountErrorToFieldMap(fetcherData?.error), ...clientErrors };
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [clientErrors, setClientErrors] = useState({});

  const submitting = fetcher.state !== 'idle';
  const fieldErrors = mergeFieldErrors(clientErrors, fetcher.data);
  const formError = fieldErrors.form;

  // After password change succeeds: sync session, revalidate, return to account page.
  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'password') return;

    async function finishPasswordChange() {
      await syncSessionProfile();
      revalidate();
      navigate(`${paths.profileSettingsAccount}?updated=password`, { replace: true });
    }

    void finishPasswordChange();
  }, [fetcher.data, navigate]);

  function handleBack() {
    goBack(navigate, paths.profileSettingsAccount);
  }

  function handleSubmit(event) {
    const formData = new FormData(event.currentTarget);
    const validation = validateAccountFormData(formData);
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
        title="Change password"
        onBack={handleBack}
        backLabel="Back to account details"
        titleIcon={<img src={settingsAssets.changeIcon} alt="Change icon" />}
      />

      <div className="settings-form-body">
        <div className="settings-form-intro content-section-intro">
          <p className="settings-form-intro-title settings-section-title"><span className="settings-section-title-underline" aria-hidden="true"></span>Choose a new password</p>
          <p className="settings-form-intro-desc settings-section-text">
            Enter and confirm your new password to change your old password
          </p>
        </div>

        <fetcher.Form
          method="post"
          action={paths.apiAccount}
          className="settings-form"
          noValidate
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="intent" value="change-password" />

          <div className="auth-field">
            <label className="auth-label" htmlFor="old-password">Old password</label>
            <div className={`auth-input-wrap${fieldErrors.oldPassword ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="old-password"
                name="oldPassword"
                type={showOld ? 'text' : 'password'}
                className="auth-input auth-input--icon auth-input--password"
                placeholder="Enter your old password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(fieldErrors.oldPassword)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowOld(v => !v)}
                aria-label={showOld ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showOld} />
              </button>
            </div>
            {fieldErrors.oldPassword ? (
              <p className="auth-field-error">{fieldErrors.oldPassword}</p>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="new-password">New password</label>
            <div className={`auth-input-wrap${fieldErrors.newPassword ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="new-password"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                className="auth-input auth-input--icon auth-input--password"
                placeholder="Enter your new password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.newPassword)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowNew(v => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showNew} />
              </button>
            </div>
            <PasswordStrengthFeedback password={newPassword} />
            {fieldErrors.newPassword ? (
              <p className="auth-field-error">{fieldErrors.newPassword}</p>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm-password">Confirm new password</label>
            <div className={`auth-input-wrap${fieldErrors.confirmPassword ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className="auth-input auth-input--icon auth-input--password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showConfirm} />
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="auth-field-error">{fieldErrors.confirmPassword}</p>
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
              {submitting ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
