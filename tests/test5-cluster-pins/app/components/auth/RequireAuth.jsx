import { useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import MemMeLogo from './MemMeLogo';

function AuthLoading() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-dot" />
    </div>
  );
}

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectingRef = useRef(false);

  useLayoutEffect(() => {
    if (loading || user || redirectingRef.current) return;
    redirectingRef.current = true;
    navigate('/login', { replace: true, state: { from: location.pathname } });
  }, [loading, user, location.pathname]); // navigate intentionally omitted — stable in RR7 but omit to avoid effect loops

  if (loading || !user) {
    return <AuthLoading />;
  }

  return children;
}

function AlreadySignedIn() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <MemMeLogo />
        <header className="auth-header">
          <h1 className="auth-title">You&apos;re already signed in</h1>
          <p className="auth-subtitle">Logged in as {user?.username}</p>
        </header>
        <div className="auth-form">
          <Link to="/" className="auth-btn auth-btn--primary">
            Continue to map
          </Link>
          <button type="button" className="auth-btn auth-btn--google" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoading />;
  if (user) return <AlreadySignedIn />;
  return children;
}

export function AuthSwitchLink({ to, children }) {
  return (
    <p className="auth-switch">
      {children}{' '}
      <Link to={to} className="auth-switch-link">{to === '/register' ? 'Create account' : 'Log in'}</Link>
    </p>
  );
}
