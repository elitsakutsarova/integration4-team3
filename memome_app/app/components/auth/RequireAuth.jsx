import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';

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
