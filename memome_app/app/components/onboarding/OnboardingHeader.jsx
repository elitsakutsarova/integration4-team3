import { onboardingAssets } from '../../utils/onboardingAssets';

export default function OnboardingHeader({ title }) {
  return (
    <header className="onboarding-header">
      <div className="onboarding-header__backdrop" aria-hidden="true">
        <img className="onboarding-header__grid" src={onboardingAssets.grid} alt="Decorative pixel grid background" />
        <img
          className="onboarding-header__decor"
          src={onboardingAssets.greenRightDecor}
          alt="Decorative green corner illustration"
        />
      </div>

      <div className="onboarding-header__title-wrap">
        <p className="onboarding-header__title">
          <span className="onboarding-header__title-highlight">{title}</span>
        </p>
      </div>
    </header>
  );
}
