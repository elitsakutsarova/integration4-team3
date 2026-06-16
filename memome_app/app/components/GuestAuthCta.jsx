import { Link } from 'react-router';
import { paths } from '../utils/appPaths';

/**
 * Reusable "Create account or log in" call-to-action panel.
 * Each call site wraps this in its own container with its own positioning styles.
 */
export default function GuestAuthCta({ copy }) {
  return (
    <>
      <p className="guest-auth-cta-copy">{copy}</p>
      <Link to={paths.register} className="guest-auth-cta-btn">
        Create Account
      </Link>
      <p className="guest-auth-cta-login">
        Already have an account?{' '}
        <Link to={paths.login}>Log in</Link>
      </p>
    </>
  );
}
