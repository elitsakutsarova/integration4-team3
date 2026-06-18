import '../styles/modules/auth.css';
import { Link, useLoaderData } from 'react-router';
import AuthHero from '../components/auth/AuthHero';
import AuthLoading from '../components/auth/AuthLoading';
import { paths } from '../utils/appPaths';
import { forgotPasswordAssets } from '../utils/forgotPasswordAssets';
import { guestOnlyMiddleware } from '../middleware/clientAuth';
import { requirePasswordResetCompletedMiddleware } from '../utils/passwordResetMiddleware';
import {
  getPasswordResetFlowEmail,
} from '../utils/passwordResetFlow';

export const clientMiddleware = [
  ...guestOnlyMiddleware,
  requirePasswordResetCompletedMiddleware,
];

function ResetSuccessHeroScene() {
  return (
    <div className="reset-success-hero-scene" aria-hidden="true">
      <img
        className="reset-success-hero-scene__path"
        src={forgotPasswordAssets.doodlePath}
        alt=""
      />
      <img
        className="reset-success-hero-scene__icon"
        src={forgotPasswordAssets.successIcon}
        alt=""
      />
    </div>
  );
}

export function meta() {
  return [
    { title: 'MemMe — Password reset' },
    { name: 'description', content: 'Your MemMe password was reset successfully.' },
  ];
}

export async function clientLoader() {
  return { email: getPasswordResetFlowEmail() };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export default function ResetPasswordSuccess() {
  const { email } = useLoaderData();

  const loginHref = paths.login;

  return (
    <div className="auth-page reset-password-success-page">
      <div className="auth-flow-shell reset-password-success-shell">
        <AuthHero scene={<ResetSuccessHeroScene />} />

        <div className="reset-success-body">
          <p className="reset-success-message">
            Your password has been{' '}
            <span className="reset-success-message__highlight">successfully reset</span>
          </p>

          <Link
            to={loginHref}
            className="auth-btn auth-btn--primary reset-success-signin"
            replace
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
