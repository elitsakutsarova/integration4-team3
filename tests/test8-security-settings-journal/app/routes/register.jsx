// this file is the registration (sign-up) page for the web app

import { useState } from 'react';
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router';
import MemMeLogo from '../components/auth/MemMeLogo';
import {
  BackpackIcon,
  CheckIcon,
  EyeIcon,
  HouseIcon,
  LockIcon,
  MailIcon,
  XIcon,
} from '../components/auth/AuthIcons';
import { AuthSwitchLink } from '../components/auth/RequireAuth';
import { getPasswordChecks, strengthBarCount } from '../utils/passwordRules';
import { registerActionError, signUpAccount } from '../utils/authActions';
import { paths } from '../utils/appPaths';
import { guestOnlyMiddleware } from '../middleware/clientAuth';
import { validateSignUpPayload } from '../utils/validators';

export const clientMiddleware = guestOnlyMiddleware;

//displays password quality/strength
function PasswordStrength({ password }) {
  const checks = getPasswordChecks(password);
  const bars = strengthBarCount(checks.strength);
  const label = checks.strength.charAt(0).toUpperCase() + checks.strength.slice(1);

  return (
    <div className="auth-password-meta">
      <div className="auth-strength-row">
        <div className="auth-strength-bars" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className={`auth-strength-bar auth-strength-bar--${checks.strength}${i < bars ? ' auth-strength-bar--active' : ''}`}
            />
          ))}
        </div>
        {password.length > 0 && (
          <span className={`auth-strength-label auth-strength-label--${checks.strength}`}>{label}</span>
        )}
      </div>

      <ul className="auth-rule-list">
        <li className={checks.hasMinLength ? 'auth-rule--ok' : password.length > 0 ? 'auth-rule--bad' : ''}>
          <span className="auth-rule-icon">{checks.hasMinLength ? <CheckIcon /> : password.length > 0 ? <XIcon /> : null}</span>
          Use at least 8 characters
        </li>
        <li className={checks.hasMixedCase ? 'auth-rule--ok' : password.length > 0 ? 'auth-rule--bad' : ''}>
          <span className="auth-rule-icon">{checks.hasMixedCase ? <CheckIcon /> : password.length > 0 ? <XIcon /> : null}</span>
          Use upper and lower case characters
        </li>
      </ul>
    </div>
  );
}

export function meta() {
  return [
    { title: 'MemMe — Create account' },
    { name: 'description', content: 'Join the MemMe community.' },
  ];
}

// runs when the form submits
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

  // send user to home page
  throw redirect(paths.home);
}

// displayes the registration form, loads action data
export default function Register() {
  const actionData = useActionData();
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);

  const fieldErrors = actionData?.fieldErrors ?? {};
  const formError = actionData?.formError ?? '';
  const submitLoading = navigation.state === 'submitting';
  const passwordChecks = getPasswordChecks(password);
  const canSubmit = passwordChecks.isValid && role !== null && !submitLoading;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <MemMeLogo />

        <header className="auth-header">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the community</p>
        </header>

        <Form method="post" className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">Username</label>
            <div className={`auth-input-wrap${fieldErrors.username ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-prefix">@</span>
              <input
                id="username"
                name="username"
                type="text"
                className="auth-input auth-input--prefixed"
                placeholder="alex_explores"
                defaultValue={actionData?.username ?? ''}
                autoComplete="username"
                required
                aria-invalid={Boolean(fieldErrors.username)}
              />
              {fieldErrors.username && (
                <span className="auth-input-status auth-input-status--error" aria-hidden="true">
                  <XIcon />
                </span>
              )}
            </div>
            {fieldErrors.username && <p className="auth-field-error">{fieldErrors.username}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <div className={`auth-input-wrap${fieldErrors.email ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><MailIcon /></span>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input auth-input--icon"
                placeholder="your@email.com"
                defaultValue={actionData?.email ?? ''}
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </div>
            {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon auth-input--password"
                value={password}
                onChange={ev => setPassword(ev.target.value)}
                autoComplete="new-password"
                required
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
            <PasswordStrength password={password} />
          </div>

          <fieldset className="auth-role-fieldset">
            <legend className="auth-label">
              I am a <span className="auth-required">*</span>
            </legend>
            <input type="hidden" name="role" value={role ?? ''} />
            <div className="auth-role-grid">
              <button
                type="button"
                className={`auth-role-btn${role === 'visitor' ? ' auth-role-btn--active' : ''}`}
                onClick={() => setRole('visitor')}
                aria-pressed={role === 'visitor'}
              >
                <BackpackIcon />
                <span>visitor</span>
              </button>
              <button
                type="button"
                className={`auth-role-btn${role === 'local' ? ' auth-role-btn--active' : ''}`}
                onClick={() => setRole('local')}
                aria-pressed={role === 'local'}
              >
                <HouseIcon />
                <span>local</span>
              </button>
            </div>
            <p className="auth-role-hint">
              {role === 'local' ? 'You live in Antwerp' : 'You are visiting Antwerp'}
            </p>
            {fieldErrors.role && <p className="auth-field-error">{fieldErrors.role}</p>}
          </fieldset>

          {formError && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {formError}
            </div>
          )}

          <button type="submit" className="auth-btn auth-btn--primary" disabled={!canSubmit}>
            {submitLoading ? 'Creating account…' : 'Create account'}
          </button>
        </Form>

        <AuthSwitchLink to={paths.login}>Already have an account?</AuthSwitchLink>
      </div>
    </div>
  );
}
