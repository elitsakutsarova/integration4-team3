// route for the login page

import '../styles/modules/auth.css';
import { useEffect, useState } from 'react';
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router';
import AuthHero from '../components/auth/AuthHero';
import { CrossCircleIcon, EyeIcon, LockIcon } from '../components/auth/AuthIcons';
import { loginActionError, signInAccount } from '../utils/authActions';
import { LOGIN_PASSWORD_ERROR } from '../utils/loginErrors';
import { clearPasswordResetFlow, getPasswordResetFlowEmailForLogin } from '../utils/passwordResetFlow';
import { paths, safeInternalRedirectPath } from '../utils/appPaths';
import { validateLoginIdentifier, validateSignInPayload } from '../utils/validators';
import { guestOnlyMiddleware } from '../middleware/clientAuth';
import { loginAssets } from '../utils/loginAssets';

export const clientMiddleware = guestOnlyMiddleware;

function clientLoginFieldError(field, value) {
  if (field === 'email') {
    const result = validateLoginIdentifier(value);
    return result.field ? result.message : '';
  }
  if (field === 'password') {
    if (!value) return 'Password is required';
    return '';
  }
  return '';
}

function resolveFieldError(field, touched, serverErrors, value) {
  if (serverErrors[field]) return serverErrors[field];
  if (!touched[field]) return '';
  return clientLoginFieldError(field, value);
}

function isLoginFieldFixed(field, currentValue, submittedValue) {
  if (submittedValue === undefined) return false;
  return currentValue !== submittedValue;
}

function getActiveServerFieldError(field, serverErrors, currentValue, submittedValue) {
  const error = serverErrors[field];
  if (!error || submittedValue === undefined) return '';
  if (isLoginFieldFixed(field, currentValue, submittedValue)) return '';
  return error;
}

function LoginFieldError({ message, id }) {
  if (!message) return null;

  return (
    <p className="login-field-error" role="alert" id={id}>
      <CrossCircleIcon />
      <span>{message}</span>
    </p>
  );
}

function isCredentialFormError(message) {
  return /incorrect username or email|incorrect email or password|invalid credentials/i.test(message ?? '');
}

export function meta() {
  return [
    { title: 'MemMe — Log in' },
    { name: 'description', content: 'Log in to MemMe.' },
  ];
}

export async function clientLoader({ request }) {
  const url = new URL(request.url);
  const redirectTo = safeInternalRedirectPath(url.searchParams.get('redirectTo')) ?? '';
  const email = getPasswordResetFlowEmailForLogin();
  return {
    authError: url.searchParams.get('authError') ?? '',
    redirectTo,
    email,
    passwordReset: false,
  };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ currentUrl, nextUrl }) {
  return currentUrl.search !== nextUrl.search;
}

export function HydrateFallback() {
  return (
    <div className="auth-page login-page">
      <div className="auth-flow-shell" />
    </div>
  );
}

export async function clientAction({ request }) {
  const formData = await request.formData();
  const fields = {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
  const validated = validateSignInPayload({
    email: fields.email,
    password: fields.password,
  });
  if (validated.field) {
    return loginActionError(validated, fields.email, fields.password);
  }

  const result = await signInAccount({
    email: validated.email,
    password: validated.password,
  });

  if (result.error) {
    const url = new URL(request.url);
    if (url.searchParams.has('authError')) {
      const params = new URLSearchParams();
      const preservedRedirect = safeInternalRedirectPath(url.searchParams.get('redirectTo'));
      if (preservedRedirect) params.set('redirectTo', preservedRedirect);
      throw redirect(params.size ? `${paths.login}?${params}` : paths.login);
    }
    return loginActionError(result.error, validated.email, validated.password);
  }

  clearPasswordResetFlow();
  throw redirect(paths.home);
}

function LoginHeroContent() {
  return (
    <div className="login-hero-content">
      <h1 className="login-title">Welcome back</h1>
      <div className="login-hero-scene" aria-hidden="true">
        <img className="login-hero__doodle" src={loginAssets.doodle} alt="Decorative doodle illustration" />
        <img className="login-hero__photo" src={loginAssets.pinPhoto} alt="Sample memo polaroid on map pin" />
      </div>
      <p className="login-subtitle">
        <span className="login-subtitle-highlight">Sign in to continue</span>
      </p>
    </div>
  );
}

export default function Login() {
  const { authError, email: loaderEmail, passwordReset } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(loaderEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const rawFieldErrors = actionData?.fieldErrors ?? {};
  const formError = actionData?.formError ?? authError;
  const credentialFormError = Boolean(
    formError && !Object.keys(rawFieldErrors).length && isCredentialFormError(formError),
  );
  const serverFieldErrors = credentialFormError
    ? { password: LOGIN_PASSWORD_ERROR }
    : rawFieldErrors;
  const loginLoading = navigation.state === 'submitting';

  const identifierServerError = getActiveServerFieldError(
    'email',
    serverFieldErrors,
    identifier,
    actionData?.email,
  );
  const passwordServerError = getActiveServerFieldError(
    'password',
    serverFieldErrors,
    password,
    actionData?.password,
  );
  const activeFieldErrors = {
    email: identifierServerError || undefined,
    password: passwordServerError || undefined,
  };

  const identifierError = resolveFieldError('email', touched, activeFieldErrors, identifier);
  const passwordError = resolveFieldError('password', touched, activeFieldErrors, password);
  const showFormBanner = Boolean(formError && !credentialFormError && !Object.keys(rawFieldErrors).length);
  const canSubmit = Boolean(identifier.trim() && password.trim())
    && !identifierError
    && !passwordError
    && !loginLoading;

  const touchField = field => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    if (actionData?.email) setIdentifier(actionData.email);
  }, [actionData?.email]);

  useEffect(() => {
    if (loaderEmail) setIdentifier(loaderEmail);
  }, [loaderEmail]);

  useEffect(() => {
    if (actionData?.fieldErrors?.email || actionData?.fieldErrors?.password) {
      setTouched({ email: true, password: true });
    }
  }, [actionData?.fieldErrors?.email, actionData?.fieldErrors?.password]);

  useEffect(() => {
    if (!actionData?.formError) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('authError')) return;
    url.searchParams.delete('authError');
    navigate(`${url.pathname}${url.search}${url.hash}`, { replace: true });
  }, [actionData, navigate]);

  return (
    <div className="auth-page login-page">
      <div className="auth-flow-shell">
        <AuthHero scene={<LoginHeroContent />} />

        {passwordReset && (
          <div className="auth-banner auth-banner--success" role="status">
            Password updated. Sign in with your new password using the same email.
          </div>
        )}

        <Form
          method="post"
          className="auth-form login-form"
          noValidate
          onSubmit={event => {
            if (!canSubmit) {
              event.preventDefault();
              setTouched({ email: true, password: true });
            }
          }}
        >
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-identifier">Username or email</label>
            <div className={`auth-input-wrap${identifierError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-prefix">@</span>
              <input
                id="login-identifier"
                name="email"
                type="text"
                className="auth-input auth-input--prefixed"
                placeholder="alex_explores"
                value={identifier}
                onChange={event => setIdentifier(event.target.value)}
                onBlur={() => touchField('email')}
                autoComplete="username email"
                required
                aria-invalid={Boolean(identifierError)}
                aria-describedby={identifierError ? 'login-identifier-error' : undefined}
              />
            </div>
            <LoginFieldError message={identifierError} id="login-identifier-error" />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password*</label>
            <div className={`auth-input-wrap login-password-wrap${passwordError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon"
                value={password}
                onChange={event => setPassword(event.target.value)}
                onBlur={() => touchField('password')}
                autoComplete="current-password"
                required
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showPassword} />
              </button>
            </div>
            <LoginFieldError message={passwordError} id="login-password-error" />
          </div>

          {showFormBanner && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {formError}
            </div>
          )}

          <div className="login-form-actions">
            <Link to={paths.forgotPassword} className="login-forgot-link">
              Forgot password?
            </Link>

            <button
              type="submit"
              className={`auth-btn auth-btn--primary login-submit${canSubmit ? ' login-submit--ready' : ''}`}
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </Form>

        <p className="login-register-prompt">
          <span className="login-register-prompt__lead">Don&apos;t have an account?</span>{' '}
          <Link to={paths.register} className="login-register-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
