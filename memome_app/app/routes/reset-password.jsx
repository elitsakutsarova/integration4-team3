import '../styles/modules/auth.css';
import { useEffect, useState } from 'react';
import {
  data,
  useFetcher,
  useLoaderData,
  useNavigate,
} from 'react-router';
import AuthBackButton from '../components/auth/AuthBackButton';
import AuthLoading from '../components/auth/AuthLoading';
import { CrossCircleIcon, EyeIcon, LockIcon } from '../components/auth/AuthIcons';
import PasswordStrengthFeedback from '../components/settings/PasswordStrengthFeedback';
import { paths, resetPasswordSuccessPath } from '../utils/appPaths';
import { forgotPasswordAssets } from '../utils/forgotPasswordAssets';
import { guestOnlyMiddleware } from '../middleware/clientAuth';
import { requirePasswordResetVerifiedMiddleware } from '../utils/passwordResetMiddleware';
import { clearBrowserAuthSession, resetPassword } from '../utils/authStore';
import {
  canAccessResetPasswordPage,
  completePasswordResetFlow,
  getPasswordResetFlowEmail,
} from '../utils/passwordResetFlow';
import { isSupabaseConfigured } from '../utils/supabase.env';
import { getPasswordChecks } from '../utils/passwordRules';
import { validatePassword, validateResetPasswordPayload } from '../utils/validators';

export { action } from './reset-password.server.js';

export const clientMiddleware = [
  ...guestOnlyMiddleware,
  requirePasswordResetVerifiedMiddleware,
];

function clientFieldError(field, values) {
  const { newPassword, confirmPassword } = values;

  if (field === 'newPassword') {
    const result = validatePassword(newPassword);
    return result.field ? result.message : '';
  }

  if (!confirmPassword) return 'Confirm your new password';

  const newResult = validatePassword(newPassword);
  if (newResult.field) return '';

  if (confirmPassword !== newResult.value) return 'Passwords do not match';
  return '';
}

function getActiveServerFieldError(serverError, currentValue, submittedValue) {
  if (!serverError || submittedValue === undefined) return '';
  return currentValue === submittedValue ? serverError : '';
}

function resolveFieldError(field, touched, serverErrors, values) {
  if (serverErrors[field]) return serverErrors[field];
  if (!touched[field]) return '';
  return clientFieldError(field, values);
}

function ResetPasswordFieldError({ message, id }) {
  if (!message) return null;

  return (
    <p className="login-field-error" role="alert" id={id}>
      <CrossCircleIcon />
      <span>{message}</span>
    </p>
  );
}

export function meta() {
  return [
    { title: 'MemMe — Reset password' },
    { name: 'description', content: 'Choose a new MemMe password.' },
  ];
}

export async function clientLoader() {
  return { email: getPasswordResetFlowEmail() };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export async function clientAction({ request, serverAction }) {
  const formData = await request.clone().formData();
  const resetEmail = String(formData.get('email') ?? '').trim();
  const validated = validateResetPasswordPayload({
    newPassword: String(formData.get('newPassword') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });

  if (validated.field) {
    return data({ error: validated });
  }

  const sessionEmail = getPasswordResetFlowEmail();
  if (!canAccessResetPasswordPage() || resetEmail !== sessionEmail) {
    return data({
      error: {
        field: 'form',
        message: 'Your reset session expired. Request a new link from forgot password.',
      },
    });
  }

  let payload;

  if (!isSupabaseConfigured()) {
    const result = await resetPassword({
      email: resetEmail,
      newPassword: validated.newPassword,
    });
    if (result.error) return data({ error: result.error });
    payload = { success: true, kind: 'password', email: resetEmail };
  } else {
    const serverResponse = await serverAction();
    payload = serverResponse?.data ?? serverResponse;
    if (payload?.error) return data({ error: payload.error });
  }

  if (payload?.success && payload?.kind === 'password') {
    await clearBrowserAuthSession();
    completePasswordResetFlow();
    return data({
      success: true,
      kind: 'password',
      email: payload.email ?? resetEmail,
    });
  }

  return data(payload);
}

function mapApiFieldErrors(fetcherData) {
  const error = fetcherData?.error;
  if (!error?.field || error.field === 'form') return {};
  return { [error.field]: error.message };
}

function mapApiFormError(fetcherData) {
  const error = fetcherData?.error;
  if (!error) return '';
  if (error.field && error.field !== 'form') return '';
  return error.message ?? '';
}

function ResetPasswordHero() {
  return (
    <header className="reset-password-hero">
      <div className="reset-password-hero__backdrop" aria-hidden="true">
        <img className="reset-password-hero__grid" src={forgotPasswordAssets.grid} alt="Decorative pixel grid background" />
        <img className="reset-password-hero__doodle" src={forgotPasswordAssets.doodle} alt="Decorative doodle illustration" />
      </div>

      <div className="reset-password-hero__nav">
        <AuthBackButton to={paths.forgotPassword} label="Back to forgot password" />
      </div>

      <div className="reset-password-hero__content">
        <div className="reset-password-title-block">
          <h1 className="reset-password-title">Reset your password</h1>
          <img
            className="reset-password-title__icon"
            src={forgotPasswordAssets.resetIcon}
            alt="Reset password lock icon"
          />
        </div>
      </div>
    </header>
  );
}

export default function ResetPassword() {
  const { email } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [submitSnapshot, setSubmitSnapshot] = useState({ newPassword: '', confirmPassword: '' });

  const apiFieldErrors = mapApiFieldErrors(fetcher.data);
  const formError = mapApiFormError(fetcher.data);
  const serverFieldErrors = {
    newPassword: getActiveServerFieldError(
      apiFieldErrors.newPassword ?? '',
      newPassword,
      submitSnapshot.newPassword,
    ),
    confirmPassword: getActiveServerFieldError(
      apiFieldErrors.confirmPassword ?? '',
      confirmPassword,
      submitSnapshot.confirmPassword,
    ),
  };

  const values = { newPassword, confirmPassword };
  const passwordChecks = getPasswordChecks(newPassword);
  const newPasswordRequiredError = touched.newPassword && !newPassword
    ? clientFieldError('newPassword', values)
    : '';
  const newPasswordFieldError = serverFieldErrors.newPassword || newPasswordRequiredError;
  const showNewPasswordInputError = Boolean(
    newPasswordFieldError
    || (touched.newPassword && newPassword.length > 0 && !passwordChecks.isValid),
  );
  const showNewPasswordStrength = newPassword.length > 0 && !newPasswordFieldError;
  const confirmPasswordError = resolveFieldError(
    'confirmPassword',
    touched,
    serverFieldErrors,
    values,
  );

  const submitting = fetcher.state !== 'idle';
  const canSubmit = passwordChecks.isValid
    && confirmPassword.length > 0
    && confirmPassword === newPassword
    && !confirmPasswordError
    && !newPasswordFieldError
    && !submitting;

  const touchField = field => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    if (fetcher.data?.error) {
      setTouched({ newPassword: true, confirmPassword: true });
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'password') return;
    navigate(resetPasswordSuccessPath(), { replace: true });
  }, [fetcher.data, email, navigate]);

  const handleSubmit = (event) => {
    const formData = new FormData(event.currentTarget);
    const validated = validateResetPasswordPayload({
      newPassword: String(formData.get('newPassword') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
    });

    if (validated.field) {
      event.preventDefault();
      setTouched({ newPassword: true, confirmPassword: true });
      return;
    }

    setSubmitSnapshot({
      newPassword: String(formData.get('newPassword') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
    });
  };

  return (
    <div className="auth-page reset-password-page">
      <div className="auth-flow-shell">
        <ResetPasswordHero />

        <p className="reset-password-intro">Enter a new password below</p>

        <fetcher.Form
          method="post"
          className="auth-form reset-password-form"
          noValidate
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="email" value={email} />

          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-new-password">New password</label>
            <div className={`auth-input-wrap login-password-wrap${showNewPasswordInputError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="reset-new-password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon"
                placeholder="Type your new password here"
                value={newPassword}
                onChange={event => setNewPassword(event.target.value)}
                onBlur={() => touchField('newPassword')}
                autoComplete="new-password"
                required
                aria-invalid={showNewPasswordInputError}
                aria-describedby={newPasswordFieldError ? 'reset-new-password-error' : undefined}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowNewPassword(value => !value)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showNewPassword} />
              </button>
            </div>
            {newPasswordFieldError ? (
              <ResetPasswordFieldError
                message={newPasswordFieldError}
                id="reset-new-password-error"
              />
            ) : (
              showNewPasswordStrength && (
                <PasswordStrengthFeedback password={newPassword} variant="register" />
              )
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-confirm-password">Repeat password</label>
            <div className={`auth-input-wrap login-password-wrap${confirmPasswordError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                onBlur={() => touchField('confirmPassword')}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(confirmPasswordError)}
                aria-describedby={confirmPasswordError ? 'reset-confirm-password-error' : undefined}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowConfirmPassword(value => !value)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showConfirmPassword} />
              </button>
            </div>
            <ResetPasswordFieldError message={confirmPasswordError} id="reset-confirm-password-error" />
          </div>

          {formError && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className={`auth-btn auth-btn--primary login-submit reset-password-submit${canSubmit ? ' login-submit--ready' : ''}`}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Change password'}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
