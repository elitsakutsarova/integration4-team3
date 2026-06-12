// route for the login page

import { useEffect, useState } from 'react';
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router';
import MemMeLogo from '../components/auth/MemMeLogo';
import { EyeIcon, LockIcon, MailIcon } from '../components/auth/AuthIcons';
import { AuthSwitchLink } from '../components/auth/RequireAuth';
import { loginActionError, signInAccount } from '../utils/authActions';
import { paths, safeInternalRedirectPath } from '../utils/appPaths';
import { guestOnlyMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = guestOnlyMiddleware;

export function meta() {
  return [
    { title: 'MemMe — Log in' },
    { name: 'description', content: 'Log in to MemMe.' },
  ];
}

export async function clientLoader({ request }) {
  const url = new URL(request.url);
  return {
    authError: url.searchParams.get('authError') ?? '',
    redirectTo: url.searchParams.get('redirectTo') ?? '',
  };
}

clientLoader.hydrate = true;

export async function clientAction({ request }) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '');
  const result = await signInAccount({ email, password });

  if (result.error) {
    const url = new URL(request.url);
    if (url.searchParams.has('authError')) {
      const params = new URLSearchParams();
      const preservedRedirect = url.searchParams.get('redirectTo');
      if (preservedRedirect) params.set('redirectTo', preservedRedirect);
      throw redirect(params.size ? `${paths.login}?${params}` : paths.login);
    }
    return loginActionError(result.error, email);
  }

  throw redirect(safeInternalRedirectPath(redirectTo) ?? paths.home);
}

export default function Login() {
  const { authError, redirectTo } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const email = actionData?.email ?? '';
  const fieldErrors = actionData?.fieldErrors ?? {};
  const formError = actionData?.formError ?? authError;
  const loginLoading = navigation.state === 'submitting';

  useEffect(() => {
    if (!actionData?.formError) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('authError')) return;
    url.searchParams.delete('authError');
    navigate(`${url.pathname}${url.search}${url.hash}`, { replace: true });
  }, [actionData, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <MemMeLogo />

        <header className="auth-header">
          <h1 className="auth-title">Log in</h1>
          <p className="auth-subtitle">Welcome back</p>
        </header>

        <Form method="post" className="auth-form" noValidate>
          {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email</label>
            <div className={`auth-input-wrap${fieldErrors.email ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><MailIcon /></span>
              <input
                id="login-email"
                name="email"
                type="email"
                className="auth-input auth-input--icon"
                placeholder="your@email.com"
                defaultValue={email}
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </div>
            {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className={`auth-input-wrap${fieldErrors.password ? ' auth-input-wrap--error' : ''}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input--icon auth-input--password"
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
            {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
          </div>

          {formError && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {formError}
            </div>
          )}

          <button type="submit" className="auth-btn auth-btn--primary" disabled={loginLoading}>
            {loginLoading ? 'Logging in…' : 'Log in'}
          </button>
        </Form>

        <AuthSwitchLink to={paths.register}>Don&apos;t have an account?</AuthSwitchLink>
      </div>
    </div>
  );
}
