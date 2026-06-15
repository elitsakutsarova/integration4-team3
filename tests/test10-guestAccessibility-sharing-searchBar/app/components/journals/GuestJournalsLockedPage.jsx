import { Link } from 'react-router';
import BottomNav from '../BottomNav';
import { paths } from '../../utils/appPaths';
import { journalAssets } from '../../utils/journalAssets';

export default function GuestJournalsLockedPage() {
  return (
    <div className="journals-page journals-page--guest-locked">
      <header className="journals-guest-hero" aria-hidden="true">
        <img
          className="journals-guest-hero-logo"
          src={journalAssets.lockedLogoMark}
          alt=""
        />
        <img
          className="journals-guest-hero-wave"
          src={journalAssets.lockedHeaderWave}
          alt=""
        />
        <img
          className="journals-guest-hero-pixel"
          src={journalAssets.lockedPixelDeco}
          alt=""
        />
      </header>

      <main className="journals-guest-main">
        <div className="journals-guest-panel">
          <img
            className="journals-guest-illustration"
            src={journalAssets.lockedIllustration}
            alt=""
          />
          <p className="journals-guest-panel-copy">
            Create account or log in to create journals
          </p>
          <Link to={paths.register} className="journals-guest-panel-btn">
            Create Account
          </Link>
          <p className="journals-guest-panel-login">
            Already have an account?{' '}
            <Link to={paths.login}>Log in</Link>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
