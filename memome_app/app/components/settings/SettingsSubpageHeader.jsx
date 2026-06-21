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

export default function SettingsSubpageHeader({ title, onBack, backLabel }) {
  return (
    <header className="settings-hero settings-hero--subpage">
      <div className="settings-hero-deco" aria-hidden="true">
        <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="" />
        <img className="settings-hero-grid settings-hero-grid--subpage" src={settingsAssets.topGrid} alt="" />
        <img className="settings-hero-wave" src={settingsAssets.vector507} alt="" />
        <img
          className="settings-hero-star settings-hero-star--mint settings-hero-star--subpage"
          src={settingsAssets.group6190}
          alt=""
        />
      </div>

      <div className="settings-title-row">
        <SettingsBackButton onClick={onBack} label={backLabel} />
        <h1 className="settings-title">
          <span className="settings-title-highlight" aria-hidden="true" />
          {title}
        </h1>
      </div>
    </header>
  );
}
