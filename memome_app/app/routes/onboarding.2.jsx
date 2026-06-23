import '../styles/modules/auth.css';
import { useNavigate } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import OnboardingFooter from '../components/onboarding/OnboardingFooter';
import OnboardingHeader from '../components/onboarding/OnboardingHeader';
import { requireAuthClientMiddleware } from '../middleware/clientAuth';
import { paths } from '../utils/appPaths';
import { onboardingAssets } from '../utils/onboardingAssets';
import {
  advanceOnboardingTo,
  ONBOARDING_STEPS,
} from '../utils/onboardingFlow';
import { requireOnboardingScreenMiddleware } from '../utils/onboardingMiddleware';

export const clientMiddleware = [
  requireAuthClientMiddleware,
  requireOnboardingScreenMiddleware(ONBOARDING_STEPS.screen2),
];

export function meta() {
  return [
    { title: 'MemMe — Your keepsakes' },
    {
      name: 'description',
      content: 'Turn every trip into a journal of memories.',
    },
  ];
}

export function HydrateFallback() {
  return <AuthLoading />;
}

export default function OnboardingScreen2() {
  const navigate = useNavigate();

  function handleBack() {
    advanceOnboardingTo(ONBOARDING_STEPS.screen1);
    navigate(paths.onboarding1, { replace: true });
  }

  function handleNext() {
    advanceOnboardingTo(ONBOARDING_STEPS.screen3);
    navigate(paths.onboarding3, { replace: true });
  }

  return (
    <div className="auth-page onboarding-page onboarding-screen2-page">
      <div className="onboarding-shell">
        <OnboardingHeader title="Every trip" />

        <img
          className="onboarding-slide__decor-bottom-left"
          src={onboardingAssets.greenStar}
          alt="Decorative star illustration"
          aria-hidden="true"
        />

        <div className="onboarding-content onboarding-screen2__content">
         {/*  <div className="onboarding-screen2__texture" aria-hidden="true">
            <img src={onboardingAssets.screen2.texture} alt="Decorative scrapbook texture background" />
          </div> */}

          <div className="onboarding-screen2__scrapbook">
            <img
              className="onboarding-screen2__doodle-left"
              src={onboardingAssets.screen2.doodle1}
              alt="Decorative doodle illustration"
              aria-hidden="true"
            />
            <img
              className="onboarding-screen2__doodle-right"
              src={onboardingAssets.screen2.doodle2}
              alt="Decorative doodle illustration"
              aria-hidden="true"
            />

            <figure className="onboarding-screen2__memo onboarding-screen2__memo--1">
              <img src={onboardingAssets.screen2.memo1} alt="Sample travel memo polaroid" />
            </figure>

            <aside className="onboarding-screen2__sticky-cluster">
              <div className="onboarding-screen2__sticky-note">
                <p>I had the best time here!</p>
              </div>
              <span className="onboarding-screen2__place-link">Antwerpen</span>
              <img
                className="onboarding-screen2__sticky-pin"
                src={onboardingAssets.screen2.pin}
                alt="Decorative map pin"
                aria-hidden="true"
              />
            </aside>

            <figure className="onboarding-screen2__memo onboarding-screen2__memo--2">
              <img src={onboardingAssets.screen2.memo2} alt="Sample travel memo polaroid" />
            </figure>

            <figure className="onboarding-screen2__memo onboarding-screen2__memo--3">
              <img src={onboardingAssets.screen2.memo3} alt="Sample travel memo polaroid" />
            </figure>
          </div>

          <div className="onboarding-screen2__bottom">
            <div className="onboarding-screen2__headline-bottom">
              <span className="onboarding-slide__headline-bar onboarding-slide__headline-bar-right">
                becomes a keepsake
              </span>
            </div>

            <div className="onboarding-slide__description onboarding-screen2__description">
              <div className="onboarding-slide__bubble bubble--two">
                <svg
                  className="onboarding-slide__bubble-shape"
                  viewBox="0 0 246 92"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  <path
                    d="M9.20834 82.225C9.20834 87.745 3.06946 91.0417 0 92C11.0481 92 18.4175 87.7833 20.7212 85.675C24.4046 89.815 34.5338 91.6167 39.1379 92H220.998C237.571 92 244.402 73.6 245.746 64.4C245.938 58.65 246.206 42.78 245.746 25.3C245.285 7.82 229.056 1.15 220.998 0H33.9558C16.9204 0 10.3594 17.25 9.20834 25.875V82.225Z"
                    fill="var(--blue-300)"
                  />
                </svg>
                <p>
                  Each memo posted gets woven into the trip&apos;s journal - yours
                  to decorate, keep, or share.
                </p>
              </div>
            </div>
          </div>
        </div>

        <OnboardingFooter
          activeStep={2}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
