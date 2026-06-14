import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import MemMeLogo from './MemMeLogo';
import { paths } from '../../utils/appPaths';


function AuthLoading() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-dot" />
    </div>
  );
}

// Fallback wrapper — protected account routes use account-layout clientMiddleware.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading || !user) return <AuthLoading />;

  return children;
}

function AlreadySignedIn() {
  const { user, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
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
          <Link to={paths.home} className="auth-btn auth-btn--primary">
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
      <Link to={to} className="auth-switch-link">
        {to === paths.register ? 'Create account' : 'Log in'}
      </Link>
    </p>
  );
}
