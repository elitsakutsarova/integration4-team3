import { RegisterLogo } from './MemMeLogo';
import { createAccountAssets } from '../../utils/createAccountAssets';

export default function AuthHero({ scene }) {
  return (
    <div className="auth-hero">
      <div className="auth-hero__backdrop" aria-hidden="true">
        <img className="auth-hero__grid" src={createAccountAssets.grid} alt="Decorative pixel grid background" />
        <div className="auth-hero__accent-wrap">
          <img className="auth-hero__accent" src={createAccountAssets.accent} alt="Decorative accent illustration" />
        </div>
        <div className="auth-hero__brand">
          <RegisterLogo />
        </div>
      </div>
      <div className="auth-hero__scene">{scene}</div>
    </div>
  );
}
