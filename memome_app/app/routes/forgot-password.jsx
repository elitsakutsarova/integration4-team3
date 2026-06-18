import '../styles/modules/auth.css';
import { useEffect, useState } from 'react';
import { Form, useActionData, useNavigate, useNavigation } from 'react-router';
import AuthBackButton from '../components/auth/AuthBackButton';
import { CrossCircleIcon } from '../components/auth/AuthIcons';
import { requestPasswordReset } from '../utils/authStore';
import { paths, resetPasswordPath } from '../utils/appPaths';
import { beginPasswordResetFlow } from '../utils/passwordResetFlow';
import { forgotPasswordAssets } from '../utils/forgotPasswordAssets';
import { guestOnlyMiddleware } from '../middleware/clientAuth';
import { validateEmail } from '../utils/validators';

export const clientMiddleware = guestOnlyMiddleware;

const INVALID_EMAIL_MESSAGE = 'Invalid email';

function clientEmailError(value) {
  const result = validateEmail(value);
  return result.field ? result.message : '';
}

function getActiveServerFieldError(serverError, currentValue, submittedValue) {
  if (!serverError || submittedValue === undefined) return '';
  return currentValue === submittedValue ? serverError : '';
}

function resolveEmailError(touched, serverError, value) {
  if (serverError) return serverError;
  if (!touched) return '';
  return clientEmailError(value);
}

function ForgotPasswordFieldError({ message, id }) {
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
    { title: 'MemMe — Forgot password' },
    { name: 'description', content: 'Reset your MemMe password.' },
  ];
}

export async function clientAction({ request }) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const validated = validateEmail(email);

  if (validated.field) {
    return { email, fieldErrors: { email: validated.message } };
  }

  const result = await requestPasswordReset(validated.value);
  if (result.error) {
    if (result.error.field === 'email') {
      return { email, fieldErrors: { email: result.error.message } };
    }
    return { email, formError: result.error.message };
  }

  return { success: true, email: validated.value };
}

function ForgotPasswordHero() {
  return (
    <header className="forgot-password-hero">
      <div className="forgot-password-hero__backdrop" aria-hidden="true">
        <img className="forgot-password-hero__grid" src={forgotPasswordAssets.grid} alt="" />
        <img className="forgot-password-hero__doodle" src={forgotPasswordAssets.doodle} alt="" />
        <img className="forgot-password-hero__star" src={forgotPasswordAssets.greenStar} alt="" />
      </div>

      <div className="forgot-password-hero__nav">
        <AuthBackButton to={paths.login} label="Back to log in" />
      </div>

      <div className="forgot-password-hero__content">
        <div className="forgot-password-title-wrap">
          <div className="forgot-password-title-lines">
            <p className="forgot-password-title-line">
              <span className="forgot-password-title-highlight">Forgot your</span>
            </p>
            <p className="forgot-password-title-line">
              <span className="forgot-password-title-highlight">password</span>
            </p>
          </div>
          <img
            className="forgot-password-title__mark"
            src={forgotPasswordAssets.questionMark}
            alt=""
          />
        </div>
      </div>
    </header>
  );
}

export default function ForgotPassword() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(actionData?.email ?? '');
  const [touched, setTouched] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const serverEmailError = getActiveServerFieldError(
    actionData?.fieldErrors?.email ?? '',
    email,
    actionData?.email,
  );
  const emailError = resolveEmailError(touched, serverEmailError, email);
  const submitting = navigation.state === 'submitting';
  const canSubmit = Boolean(email.trim()) && !emailError && !submitting;

  useEffect(() => {
    if (actionData?.email) setEmail(actionData.email);
  }, [actionData?.email]);

  useEffect(() => {
    if (actionData?.fieldErrors?.email) setTouched(true);
  }, [actionData?.fieldErrors?.email]);

  useEffect(() => {
    if (!actionData?.success || !actionData?.email) return;

    setShowSuccessPopup(true);
    const timer = window.setTimeout(() => {
      beginPasswordResetFlow(actionData.email);
      navigate(resetPasswordPath());
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [actionData?.success, actionData?.email, navigate]);

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-flow-shell">
        <ForgotPasswordHero />

        <div className="forgot-password-intro">
          <p className="forgot-password-intro__lead">Enter your email address</p>
          <p className="forgot-password-intro__hint">
            We&apos;ll send you a link to reset your password
          </p>
        </div>

        <Form
          method="post"
          className="auth-form forgot-password-form"
          noValidate
          onSubmit={event => {
            if (!canSubmit) {
              event.preventDefault();
              setTouched(true);
            }
          }}
        >
            <div className="auth-field">
              <label className="auth-label" htmlFor="forgot-password-email">Email</label>
              <div className={`auth-input-wrap${emailError ? ' auth-input-wrap--error' : ''}`}>
                <span className="auth-input-prefix">@</span>
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  className="auth-input auth-input--prefixed"
                  placeholder="alex_explores"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  onBlur={() => setTouched(true)}
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'forgot-password-email-error' : undefined}
                />
              </div>
              <ForgotPasswordFieldError message={emailError} id="forgot-password-email-error" />
            </div>

            {actionData?.formError && (
              <div className="auth-banner auth-banner--warning" role="alert">
                {actionData.formError}
              </div>
            )}

            <button
              type="submit"
              className={`auth-btn auth-btn--primary login-submit forgot-password-submit${canSubmit ? ' login-submit--ready' : ''}`}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Request link'}
            </button>
        </Form>
      </div>

      {showSuccessPopup && (
        <div className="auth-success-toast-backdrop" role="presentation">
          <div className="auth-success-toast" role="status" aria-live="polite">
            Link requested successfully
          </div>
        </div>
      )}
    </div>
  );
}
