import { Link } from 'react-router';
import LoggedOutLogo from './LoggedOutLogo';
import { guestHomePath, paths } from '../../utils/appPaths';
import { loggedOutAssets } from '../../utils/loggedOutAssets';

function ExploreArrowIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true" className="logged-out-page__explore-arrow">
      <path
        d="M1 8h14M10 2l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoggedOutScreen() {
  return (
    <div className="logged-out-page">
      <img
        className="logged-out-page__hero-grid"
        src={loggedOutAssets.heroGrid}
        alt=""
        aria-hidden="true"
      />
      <img
        className="logged-out-page__footer-grid"
        src={loggedOutAssets.heroGrid}
        alt=""
        aria-hidden="true"
      />

      <div className="logged-out-page__content">
        <div className="logged-out-page__deco logged-out-page__deco--top-left" aria-hidden="true">
          <img
            className="logged-out-page__hand logged-out-page__hand--mobile"
            src={loggedOutAssets.handIllustration}
            alt=""
          />
        </div>

        <div className="logged-out-page__deco logged-out-page__deco--top-right" aria-hidden="true">
          <img
            className="logged-out-page__hand logged-out-page__hand--desktop"
            src={loggedOutAssets.handIllustration}
            alt=""
          />
          <img
            className="logged-out-page__star"
            src={loggedOutAssets.star}
            alt=""
          />
          <img
            className="logged-out-page__camera"
            src={loggedOutAssets.camera}
            alt=""
          />
        </div>

        <div className="logged-out-page__center">
          <main className="logged-out-page__main" aria-hidden="true" />

          <section className="logged-out-page__cta" aria-label="Account options">
            <Link to={paths.register} className="logged-out-page__create-btn">
              Create Account
            </Link>
            <p className="logged-out-page__login-prompt">
              <span className='logged-out-page__login-prompt-text bold-text'>Already have an account?</span>
              {' '}
              <Link to={paths.login} className="logged-out-page__login-link underline-text">
                Log in
              </Link>
            </p>
          </section>
        </div>

        <div className="logged-out-page__deco logged-out-page__deco--bottom-left" aria-hidden="true">
          <img
            className="logged-out-page__photo-star"
            src={loggedOutAssets.photoStar}
            alt=""
          />
          <img
            className="logged-out-page__photo-hero"
            src={loggedOutAssets.photoHero}
            alt=""
          />
          <img
            className="logged-out-page__blue-grid"
            src={loggedOutAssets.blueGrid}
            alt=""
          />
        </div>
      </div>

      <div className="logged-out-page__content logged-out-page__logo-layer">
        <div className="logged-out-page__center">
          <main className="logged-out-page__main">
            {/* <LoggedOutLogo /> */}
            <div className="logged-out-logo" aria-label="MemoMe">
              <img className="logged-out-logo-img" src={loggedOutAssets.logoSvg} alt="Logo of MemoMe app" aria-hidden="true" />
            </div>
          </main>
        </div>
      </div>

      <footer className="logged-out-page__footer">
        <img
          className="logged-out-page__blue-grid logged-out-page__blue-grid--mobile"
          src={loggedOutAssets.blueGrid}
          alt=""
          aria-hidden="true"
        />
        <Link to={guestHomePath()} replace className="logged-out-page__explore-link">
          Explore map without account
          <ExploreArrowIcon  />
        </Link>
      </footer>
    </div>
  );
}
