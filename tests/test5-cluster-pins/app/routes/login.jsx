import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import MemMeLogo from '../components/auth/MemMeLogo';
import { EyeIcon, GoogleIcon, LockIcon, MailIcon } from '../components/auth/AuthIcons';
import { AuthSwitchLink, RedirectIfAuthed } from '../components/auth/RequireAuth';
import { useAuth } from '../context/AuthContext';

export function meta() {
  return [
    { title: 'MemMe — Log in' },
    { name: 'description', content: 'Log in to MemMe.' },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, signInWithGoogle, resendConfirmationEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(
    () => searchParams.get('authError') ?? location.state?.authError ?? '',
  );
  const [formSuccess, setFormSuccess] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;
  const showResendConfirmation = /confirm/i.test(formError);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setErrors({});
    setLoading(true);

    const result = await signIn({ email, password });
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

  async function handleResendConfirmation() {
    setFormSuccess('');
    setResendLoading(true);
    const result = await resendConfirmationEmail(email);
    setResendLoading(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setFormError('');
    setFormSuccess(result.message);
  }

  async function handleGoogle() {
    setFormError('');
    const result = await signInWithGoogle();
    if (result.error) setFormError(result.error.message);
    if (result.user) navigate('/', { replace: true });
  }

  return (
    <RedirectIfAuthed>
      <div className="auth-page">
        <div className="auth-card">
          <MemMeLogo />

          <header className="auth-header">
            <h1 className="auth-title">Log in</h1>
            <p className="auth-subtitle">Welcome back</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <div className={`auth-input-wrap${errors.email ? ' auth-input-wrap--error' : ''}`}>
                <span className="auth-input-icon"><MailIcon /></span>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input auth-input--icon"
                  placeholder="your@email.com"
                  value={email}
                  onChange={ev => setEmail(ev.target.value)}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && <p className="auth-field-error">{errors.email}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className={`auth-input-wrap${errors.password ? ' auth-input-wrap--error' : ''}`}>
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input--icon auth-input--password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
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
              {errors.password && <p className="auth-field-error">{errors.password}</p>}
            </div>

            {formError && (
              <div className="auth-banner auth-banner--warning" role="alert">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="auth-banner auth-banner--success" role="status">
                {formSuccess}
              </div>
            )}

            {showResendConfirmation && (
              <button
                type="button"
                className="auth-btn auth-btn--google"
                disabled={!email.trim() || resendLoading}
                onClick={handleResendConfirmation}
              >
                {resendLoading ? 'Sending…' : 'Resend confirmation email'}
              </button>
            )}

            <button type="submit" className="auth-btn auth-btn--primary" disabled={!canSubmit}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <button type="button" className="auth-btn auth-btn--google" onClick={handleGoogle}>
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <AuthSwitchLink to="/register">Don&apos;t have an account?</AuthSwitchLink>

          <p className="auth-demo-hint">
            New here? <Link to="/register" className="auth-switch-link">Create an account</Link> to get started.
          </p>
        </div>
      </div>
    </RedirectIfAuthed>
  );
}
