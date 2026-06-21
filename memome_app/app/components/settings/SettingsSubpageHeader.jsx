import { settingsAssets } from '../../utils/settingsAssets';

export function SettingsBackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      className="settings-back-btn btn-chevron"
      onClick={onClick}
      aria-label={label}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="#1952ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
        {/* <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="" />
        <img className="settings-hero-grid settings-hero-grid--subpage" src={settingsAssets.topGrid} alt="" />
        <img className="settings-hero-wave" src={settingsAssets.vector507} alt="" /> */}
        <img className="settings-hero-grid" src={settingsAssets.greenGrid} alt="" />
        <div className="settings-hero-grid-pattern grid-pattern" />
        <svg className="settings-hero-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 111" fill="none">
          <path d="M0 27.5527C26.6667 53.5527 64.1927 124.237 114.5 75.5527C145.5 45.5527 87 44.0527 106 75.5527C125 107.053 163 123.053 193.5 95.0527C224 67.0527 249 46.0527 279 52.5527C309 59.0527 394 47.0527 396 0.0527344" stroke="#A3BAFF" stroke-width="2.47" stroke-dasharray="8 8" />
        </svg>
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
