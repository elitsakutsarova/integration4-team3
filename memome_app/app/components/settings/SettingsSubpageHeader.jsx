import { settingsAssets } from '../../utils/settingsAssets';

export function SettingsBackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      className="settings-back-btn"
      onClick={onClick}
      aria-label={label}
    >
      <img src={settingsAssets.arrowBack} alt="" width={32} height={32} aria-hidden="true" />
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
        {/* <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="" />
        <img className="settings-hero-grid settings-hero-grid--subpage" src={settingsAssets.topGrid} alt="" />
        <img className="settings-hero-wave" src={settingsAssets.vector507} alt="" /> */}
        <img className="settings-hero-grid" src={settingsAssets.greenGrid} alt="" />
        <div className="settings-hero-grid-pattern grid-pattern" />
        {/* <img
          className="settings-hero-star settings-hero-star--mint settings-hero-star--subpage"
          src={settingsAssets.group6190}
          alt=""
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
