import { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { AuthSwitchLink, RedirectIfAuthed } from '../components/auth/RequireAuth';
import { useAuth } from '../context/AuthContext';
import { getPasswordChecks, strengthBarCount } from '../utils/passwordRules';

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

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const passwordChecks = getPasswordChecks(password);
  const canSubmit =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordChecks.isValid &&
    role !== null &&
    !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');
    setErrors({});

    if (!role) return;

    setLoading(true);
    const result = await signUp({ username, email, password, role });
    setLoading(false);

    if (result.error) {
      if (result.error.field === 'form') {
        setFormError(result.error.message);
      } else {
        setErrors({ [result.error.field]: result.error.message });
      }
      return;
    }

    navigate('/', { replace: true });
  }

  const usernameError = errors.username;
  const emailError = errors.email;
  const showRoleWarning = submitted && !role;

  return (
    <RedirectIfAuthed>
      <div className="auth-page">
        <div className="auth-card">
          <MemMeLogo />

          <header className="auth-header">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join the community</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">Username</label>
              <div className={`auth-input-wrap${usernameError ? ' auth-input-wrap--error' : ''}`}>
                <span className="auth-input-prefix">@</span>
                <input
                  id="username"
                  type="text"
                  className="auth-input auth-input--prefixed"
                  placeholder="alex_explores"
                  value={username}
                  onChange={ev => setUsername(ev.target.value)}
                  autoComplete="username"
                  aria-invalid={Boolean(usernameError)}
                />
                {usernameError && (
                  <span className="auth-input-status auth-input-status--error" aria-hidden="true">
                    <XIcon />
                  </span>
                )}
              </div>
              {usernameError && <p className="auth-field-error">{usernameError}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <div className={`auth-input-wrap${emailError ? ' auth-input-wrap--error' : ''}`}>
                <span className="auth-input-icon"><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  className="auth-input auth-input--icon"
                  placeholder="your@email.com"
                  value={email}
                  onChange={ev => setEmail(ev.target.value)}
                  autoComplete="email"
                  aria-invalid={Boolean(emailError)}
                />
              </div>
              {emailError && <p className="auth-field-error">{emailError}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input--icon auth-input--password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                  autoComplete="new-password"
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
              <PasswordStrength password={password} />
            </div>

            <fieldset className="auth-role-fieldset">
              <legend className="auth-label">
                I am a <span className="auth-required">*</span>
              </legend>
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
            </fieldset>

            {showRoleWarning && (
              <div className="auth-banner auth-banner--warning" role="alert">
                Please select Visitor or Local to continue
              </div>
            )}

            {formError && (
              <div className="auth-banner auth-banner--warning" role="alert">
                {formError}
              </div>
            )}

            <button type="submit" className="auth-btn auth-btn--primary" disabled={!canSubmit}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <AuthSwitchLink to="/login">Already have an account?</AuthSwitchLink>
        </div>
      </div>
    </RedirectIfAuthed>
  );
}
