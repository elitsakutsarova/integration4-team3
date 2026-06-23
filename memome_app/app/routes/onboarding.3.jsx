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
  completeOnboardingFlow,
  ONBOARDING_STEPS,
} from '../utils/onboardingFlow';
import { requireOnboardingScreenMiddleware } from '../utils/onboardingMiddleware';

export const clientMiddleware = [
  requireAuthClientMiddleware,
  requireOnboardingScreenMiddleware(ONBOARDING_STEPS.screen3),
];

export function meta() {
  return [
    { title: 'MemMe - Collect stickers' },
    {
      name: 'description',
      content: 'Scan stickers across the city and grow your collection.',
    },
  ];
}

export function HydrateFallback() {
  return <AuthLoading />;
}

export default function OnboardingScreen3() {
  const navigate = useNavigate();

  function handleBack() {
    advanceOnboardingTo(ONBOARDING_STEPS.screen2);
    navigate(paths.onboarding2, { replace: true });
  }

  function handleStart() {
    completeOnboardingFlow();
    navigate(paths.home, { replace: true });
  }

  return (
    <div className="auth-page onboarding-page onboarding-screen3-page">
      <div className="onboarding-shell">
        <OnboardingHeader title="Collect the city" />

        <img
          className="onboarding-slide__decor-bottom-left"
          src={onboardingAssets.greenStar}
          alt="Decorative star illustration"
          aria-hidden="true"
        />

        <div className="onboarding-content onboarding-screen3__content">
          <div className="onboarding-screen3__scene">
            <picture className="onboarding-screen3__stickers-pole">
              <source
                media="(min-width: 30em)"
                srcSet={onboardingAssets.screen3.stickersBig}
              />
              <img
                src={onboardingAssets.screen3.stickersVisual}
                alt="A city pole covered in collectible stickers"
              />
            </picture>

            <figure className="onboarding-screen3__phone-wrap">
              <img
                className="onboarding-screen3__phone-img"
                src={onboardingAssets.screen3.phone}
                alt="Phone showing a new sticker alert"
              />
            </figure>
          </div>

          <div className="onboarding-screen3__bottom">
            <div className="onboarding-screen3__headline-bottom">
              <span className="onboarding-slide__headline-bar onboarding-slide__headline-bar3">
                one sticker at a time
              </span>
            </div>

            <div className="onboarding-slide__description onboarding-screen3__description">
              <div className="onboarding-slide__bubble bubble--three">
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
                  Scan physical stickers hidden across the city and earn digital
                  ones for your collection!
                </p>
              </div>
            </div>
          </div>
        </div>

        <OnboardingFooter
          activeStep={3}
          onBack={handleBack}
          onNext={handleStart}
          nextLabel="Start exploring"
        />
      </div>
    </div>
  );
}
