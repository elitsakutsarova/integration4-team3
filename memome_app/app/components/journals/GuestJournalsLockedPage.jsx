import BottomNav from '../BottomNav';
import { journalAssets } from '../../utils/journalAssets';
import GuestAuthCta from '../GuestAuthCta';

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
          <GuestAuthCta copy="Create account or log in to create journals" />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
