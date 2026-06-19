import { Link } from 'react-router';

const TOTAL_ONBOARDING_SCREENS = 3;

function OnboardingFooterAction({ className, children, onClick, to }) {
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export default function OnboardingFooter({
  activeStep,
  skipTo,
  onSkip,
  nextLabel = 'Next',
  nextTo,
  onNext,
}) {
  return (
    <footer className="onboarding-footer">
      <div className="onboarding-footer__actions">
        <OnboardingFooterAction
          className="onboarding-footer__skip"
          onClick={onSkip}
          to={skipTo}
        >
          Skip
        </OnboardingFooterAction>

        <OnboardingFooterAction
          className="onboarding-footer__next"
          onClick={onNext}
          to={nextTo}
        >
          {nextLabel}
        </OnboardingFooterAction>
      </div>

      <div
        className="onboarding-footer__progress"
        aria-label={`Step ${activeStep} of ${TOTAL_ONBOARDING_SCREENS}`}
      >
        {Array.from({ length: TOTAL_ONBOARDING_SCREENS }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === activeStep;
          return (
            <span
              key={stepNumber}
              className={`onboarding-footer__dot${isActive ? ' onboarding-footer__dot--active' : ''}`}
              aria-hidden={!isActive}
              aria-current={isActive ? 'step' : undefined}
            />
          );
        })}
      </div>
    </footer>
  );
}
