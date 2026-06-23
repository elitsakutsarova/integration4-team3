import { settingsAssets } from '../../utils/settingsAssets';

export function SettingsBackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      className="settings-back-btn btn-chevron"
      onClick={onClick}
      aria-label={label}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
        <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" strokeWidth="2.5" />
      </svg>
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
