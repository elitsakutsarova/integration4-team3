// this file is the registration (sign-up) page for the web app

import '../styles/modules/auth.css';
import { useEffect, useRef, useState } from 'react';
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router';
import { RegisterLogo } from '../components/auth/MemMeLogo';
import {
  CrossCircleIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  RegisterLocalIcon,
  RegisterVisitorIcon,
  WarningTriangleIcon,
} from '../components/auth/AuthIcons';
import PasswordStrengthFeedback from '../components/settings/PasswordStrengthFeedback';
import { getPasswordChecks } from '../utils/passwordRules';
import { registerActionError, signUpAccount } from '../utils/authActions';
import { checkUsernameTaken } from '../utils/authStore';
import { paths } from '../utils/appPaths';
import { guestOnlyMiddleware } from '../middleware/clientAuth';
import {
  validateEmail,
  validatePassword,
  validateSignUpPayload,
  validateUsername,
  validateUserRole,
} from '../utils/validators';
import { createAccountAssets } from '../utils/createAccountAssets';

export const clientMiddleware = guestOnlyMiddleware;

const ROLE_REQUIRED_MESSAGE = 'Please select if you are a Visitor or a Local to continue';
const USERNAME_TAKEN_MESSAGE = 'Username already taken';

function clientFieldError(field, value) {
  if (field === 'username') {
    const result = validateUsername(value);
    return result.field ? result.message : '';
  }
  if (field === 'email') {
    const result = validateEmail(value);
    return result.field ? result.message : '';
  }
  if (field === 'password') {
    const result = validatePassword(value);
    return result.field ? result.message : '';
  }
  if (field === 'role') {
    const result = validateUserRole(value);
    return result.field ? result.message : '';
  }
  return '';
}

function resolveFieldError(field, touched, serverErrors, value, asyncError = '') {
  if (serverErrors[field]) return serverErrors[field];
  if (asyncError) return asyncError;
  if (!touched[field]) return '';
  return clientFieldError(field, value);
}

function getActiveServerFieldError(field, serverErrors, currentValue, submittedValue) {
  const error = serverErrors[field];
  if (!error || submittedValue === undefined) return '';
  return currentValue === submittedValue ? error : '';
}

function markRoleTouchedOnBlur(event, setTouched) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    setTouched(prev => ({ ...prev, role: true }));
  }
}

function RegisterFieldError({ message, id }) {
  if (!message) return null;

  return (
    <p className="register-field-error" role="alert" id={id}>
      <CrossCircleIcon />
      <span>{message}</span>
    </p>
  );
}

function RegisterRoleError({ message }) {
  if (!message) return null;

  return (
    <p className="register-role-error" role="alert">
      <WarningTriangleIcon />
      <span>{message}</span>
    </p>
  );
}

export function meta() {
  return [
    { title: 'MemMe — Create account' },
    { name: 'description', content: 'Join the MemMe community.' },
  ];
}

export async function clientAction({ request }) {
  const formData = await request.formData();
  const validated = validateSignUpPayload({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  const fields = {
    username: String(formData.get('username') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    role: String(formData.get('role') ?? '').trim(),
  };

  if (validated.field) {
    return registerActionError(validated, fields);
  }

  const result = await signUpAccount(validated);

  if (result.error) {
    return registerActionError(result.error, fields);
  }

  throw redirect(paths.home);
}

function RegisterHero() {
  return (
    <div className="register-hero" aria-hidden="true">
      <img className="register-hero__grid" src={createAccountAssets.grid} alt="" />
      <div className="register-hero__accent-wrap">
        <img className="register-hero__accent" src={createAccountAssets.accent} alt="" />
      </div>
      <div className="register-hero__brand">
        <RegisterLogo />
      </div>
      <div className="register-hero__scene">
        <div className="register-hero__path-wrap">
          <img className="register-hero__path" src={createAccountAssets.path} alt="" />
          <img className="register-title-heart" src={createAccountAssets.heart} alt="" />
        </div>
        <img className="register-hero__pin" src={createAccountAssets.pin} alt="" />
      </div>
    </div>
  );
}

function RoleCard({ role, value, label, Icon, tiltClass, onSelect }) {
  const isActive = role === value;

  return (
    <button
      type="button"
      className={`register-role-card ${tiltClass}${isActive ? ' register-role-card--active' : ''}`}
      onClick={() => onSelect(value)}
      aria-pressed={isActive}
    >
      <span
        className={`register-role-card__panel${
          isActive ? ` register-role-card__panel--${value}` : ''
        }`}
      >
        <span className="register-role-card__icon">
          <Icon active={isActive} />
        </span>
      </span>
      <span className="register-role-card__label">{label}</span>
    </button>
  );
}

export default function Register() {
  const actionData = useActionData();
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    role: false,
  });
  const [usernameAvailabilityError, setUsernameAvailabilityError] = useState('');
  const usernameCheckRef = useRef(0);

  useEffect(() => {
    if (actionData?.username) setUsername(actionData.username);
    if (actionData?.email) setEmail(actionData.email);
    if (actionData?.role) setRole(actionData.role);
  }, [actionData?.username, actionData?.email, actionData?.role]);

  const fieldErrors = actionData?.fieldErrors ?? {};
  const formError = actionData?.formError ?? '';
  const submitLoading = navigation.state === 'submitting';
  const passwordChecks = getPasswordChecks(password);
  const usernameServerError = getActiveServerFieldError(
    'username',
    fieldErrors,
    username,
    actionData?.username,
  );
  const emailServerError = getActiveServerFieldError(
    'email',
    fieldErrors,
    email,
    actionData?.email,
  );
  const activeFieldErrors = {
    ...fieldErrors,
    username: usernameServerError || undefined,
    email: emailServerError || undefined,
  };
  const canSubmit = passwordChecks.isValid
    && role !== null
    && !usernameAvailabilityError
    && !usernameServerError
    && !submitLoading;

  const usernameError = resolveFieldError(
    'username',
    touched,
    activeFieldErrors,
    username,
    usernameAvailabilityError,
  );
  const emailError = resolveFieldError('email', touched, activeFieldErrors, email);
  const passwordRequiredError = touched.password && !password
    ? clientFieldError('password', password)
    : '';
  const showPasswordError = Boolean(
    passwordRequiredError
    || (touched.password && password.length > 0 && !passwordChecks.isValid),
  );
  const showPasswordStrength = password.length > 0;
  const roleError = fieldErrors.role
    ?? ((touched.role || attemptedSubmit) && !role ? ROLE_REQUIRED_MESSAGE : '');

  const touchField = field => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleUsernameBlur = async () => {
    touchField('username');
    const valueAtBlur = username;
    const checkId = ++usernameCheckRef.current;
    setUsernameAvailabilityError('');

    if (clientFieldError('username', valueAtBlur)) return;

    try {
      const taken = await checkUsernameTaken(valueAtBlur);
      if (checkId !== usernameCheckRef.current) return;
      if (taken) setUsernameAvailabilityError(USERNAME_TAKEN_MESSAGE);
    } catch {
      // Submit-time validation still catches duplicates if the lookup fails.
    }
  };

  const roleHint =
    role === 'local'
      ? 'You live in Antwerp'
      : role === 'visitor'
        ? 'You are visiting Antwerp'
        : null;

  return (
    <div className="auth-page register-page">
      <div className="register-shell">
        <RegisterHero 
        />

        <header className="register-header">
          <div className="register-title-row">
            <h1 className="register-title">
              Create <span className="register-title-highlight">account</span>
            </h1>
          </div>
          <p className="register-subtitle">and start collecting memories</p>
        </header>

        <Form
          method="post"
          className="auth-form register-form"
          noValidate
          onSubmit={event => {
            if (!canSubmit) {
              event.preventDefault();
              setAttemptedSubmit(true);
              setTouched({
                username: true,
                email: true,
                password: true,
                role: true,
              });
            }
          }}
        >
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">Username*</label>
            <div className={`auth-input-wrap${usernameError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-prefix">@</span>
              <input
                id="username"
                name="username"
                type="text"
                className="auth-input auth-input--prefixed"
                placeholder="alex_explores"
                value={username}
                onChange={event => {
                  usernameCheckRef.current += 1;
                  setUsername(event.target.value);
                  setUsernameAvailabilityError('');
                }}
                onBlur={handleUsernameBlur}
                autoComplete="username"
                required
                aria-invalid={Boolean(usernameError)}
                aria-describedby={usernameError ? 'username-error' : undefined}
              />
            </div>
            <RegisterFieldError message={usernameError} id="username-error" />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email*</label>
            <div className={`auth-input-wrap${emailError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><MailIcon /></span>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input auth-input--icon"
                placeholder="your@email.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                onBlur={() => touchField('email')}
                autoComplete="email"
                required
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
            </div>
            <RegisterFieldError message={emailError} id="email-error" />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password*</label>
            <div className={`auth-input-wrap register-password-wrap${showPasswordError ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon"
                value={password}
                onChange={event => setPassword(event.target.value)}
                onBlur={() => touchField('password')}
                autoComplete="new-password"
                required
                aria-invalid={showPasswordError}
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={!showPassword} />
              </button>
            </div>
            {passwordRequiredError ? (
              <RegisterFieldError message={passwordRequiredError} id="password-error" />
            ) : (
              showPasswordStrength && <PasswordStrengthFeedback password={password} variant="register" />
            )}
          </div>

          <hr className="register-form-divider" />

          <fieldset
            className="auth-role-fieldset register-role-fieldset"
            onBlur={event => markRoleTouchedOnBlur(event, setTouched)}
          >
            <legend className="auth-label auth-label-margin-added">I am a *</legend>
            <input type="hidden" name="role" value={role ?? ''} />
            <div className="register-role-grid">
              <RoleCard
                role={role}
                value="visitor"
                label="Visitor"
                Icon={RegisterVisitorIcon}
                tiltClass="register-role-card--visitor"
                onSelect={value => {
                  setRole(value);
                  setAttemptedSubmit(false);
                  setTouched(prev => ({ ...prev, role: false }));
                }}
              />
              <RoleCard
                role={role}
                value="local"
                label="Local"
                Icon={RegisterLocalIcon}
                tiltClass="register-role-card--local"
                onSelect={value => {
                  setRole(value);
                  setAttemptedSubmit(false);
                  setTouched(prev => ({ ...prev, role: false }));
                }}
              />
            </div>
            {roleHint && (
              <p className="register-role-hint">
                <img className="register-role-hint__pin" src={createAccountAssets.pin_smooth} alt="" />
                <span className="register-role-hint__text">{roleHint}</span>
              </p>
            )}
            <RegisterRoleError message={roleError} />
          </fieldset>

          {formError && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className={`auth-btn auth-btn--primary register-submit${canSubmit ? ' register-submit--ready' : ''}`}
            disabled={submitLoading}
          >
            {submitLoading ? 'Creating account…' : 'Create account'}
          </button>
        </Form>

        <p className="register-legal">
          By creating an account you agree to our{' '}
          <span className="register-legal-link">Terms</span>
          {' '}and{' '}
          <span className="register-legal-link">Privacy Policy</span>
        </p>

        <p className="register-login-prompt">
          <span className="register-login-prompt__lead">Already have an account?</span>{' '}
          <Link to={paths.login} className="register-login-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
