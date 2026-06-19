import '../styles/modules/auth.css';
import { useNavigate } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import OnboardingFooter from '../components/onboarding/OnboardingFooter';
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
  requireOnboardingScreenMiddleware(ONBOARDING_STEPS.screen1),
];

export function meta() {
  return [
    { title: 'MemMe — Welcome' },
    { name: 'description', content: 'Discover Antwerp through real memories.' },
  ];
}

export function HydrateFallback() {
  return <AuthLoading />;
}

export default function OnboardingScreen1() {
  const navigate = useNavigate();

  function handleSkip() {
    completeOnboardingFlow();
    navigate(paths.home, { replace: true });
  }

  function handleNext() {
    advanceOnboardingTo(ONBOARDING_STEPS.screen2);
    navigate(paths.onboarding2, { replace: true });
  }

  return (
    <div className="auth-page onboarding-page onboarding-screen1-page">
      <div className="onboarding-slide">
        <div className="onboarding-slide__backdrop" aria-hidden="true">
          <img
            className="onboarding-slide__grid"
            src={onboardingAssets.grid}
            alt=""
          />
        </div>

        <img
          className="onboarding-slide__decor-top-right"
          src={onboardingAssets.greenRightDecor}
          alt=""
          aria-hidden="true"
        />
        <img
          className="onboarding-slide__decor-bottom-left"
          src={onboardingAssets.greenStar}
          alt=""
          aria-hidden="true"
        />

        <img
          className="onboarding-slide__doodle-left"
          src={onboardingAssets.screen1.doodle1}
          alt=""
          aria-hidden="true"
        />
        <img
          className="onboarding-slide__doodle-right"
          src={onboardingAssets.screen1.doodle2}
          alt=""
          aria-hidden="true"
        />

        <div className="onboarding-slide__headline-top">
          <span className="onboarding-slide__headline-bar">The best stories</span>
        </div>

        <div className="onboarding-slide__phone-section">
          <div className="onboarding-slide__phone-wrap">
            <img
              className="onboarding-slide__phone-img"
              src={onboardingAssets.screen1.phone}
              alt="MemoMe app showing a map of Antwerp with memory markers"
            />
            <span className="onboarding-slide__tag onboarding-slide__tag--events">
              Events
            </span>
            <span className="onboarding-slide__tag onboarding-slide__tag--memories">
              Memories
            </span>
            <img
              className="onboarding-slide__music-icon"
              src={onboardingAssets.screen1.music}
              alt=""
              aria-hidden="true"
            />
            <img
              className="onboarding-slide__memo-img"
              src={onboardingAssets.screen1.memo}
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="onboarding-slide__bottom">
          <div className="onboarding-slide__headline-bottom">
            <span className="onboarding-slide__headline-bar onboarding-slide__headline-bar-right">happen in Antwerp</span>
          </div>

          <div className="onboarding-slide__description">
            <div className="onboarding-slide__bubble">
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
                Discover the city through real memories left by locals and travellers
                before you.
              </p>
            </div>
          </div>

          <OnboardingFooter activeStep={1} onSkip={handleSkip} onNext={handleNext} />
        </div>
      </div>
    </div>
  );
}
