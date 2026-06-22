import { settingsAssets } from '../../utils/settingsAssets';

export function SettingsBackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      className="settings-back-btn btn-chevron"
      onClick={onClick}
      aria-label={label}
    >
<<<<<<< HEAD
      <img src={settingsAssets.arrowBack} alt="Back arrow" width={32} height={32} aria-hidden="true" />
=======
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="23" viewBox="0 0 26 23" fill="none">
        <path d="M25.4309 11.707H1.43091M12.4309 22.207L1.43091 11.707L12.4309 0.707031" stroke="#1952FF" stroke-width="2" />
      </svg>
>>>>>>> main
    </button>
  );
}

export default function SettingsSubpageHeader({
  title,
  onBack,
  backLabel,
  titleIcon,
}) {
  return (
    <header className="settings-hero settings-hero--subpage">
      <div className="settings-hero-deco" aria-hidden="true">
        {/* <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="Decorative hero mask" />
        <img className="settings-hero-grid settings-hero-grid--subpage" src={settingsAssets.topGrid} alt="Decorative pixel grid background" />
        <img className="settings-hero-wave" src={settingsAssets.vector507} alt="Decorative wave illustration" /> */}
        <img className="settings-hero-grid" src={settingsAssets.greenGrid} alt="Decorative pixel grid background" />
        <div className="settings-hero-grid-pattern grid-pattern" />
        {/* <img
          className="settings-hero-star settings-hero-star--mint settings-hero-star--subpage"
          src={settingsAssets.group6190}
          alt="Decorative star illustration"
        /> */}
      </div>

      <div className="settings-title-row">
        <div className="settings-titles titles">
          <SettingsBackButton onClick={onBack} label={backLabel} />
          <h1 className="settings-title">
            <span className="settings-title-highlight" aria-hidden="true" />
            {title}
          </h1>
        </div>
        <div className="settings-title-icon--subpage grid-icon" aria-hidden={!titleIcon}>
          {titleIcon}
        </div>
      </div>
    </header>
  );
}
