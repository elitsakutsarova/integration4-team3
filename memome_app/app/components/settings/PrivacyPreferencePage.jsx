// settings page for changing the app privacy settings

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { goBack, paths } from '../../utils/appPaths';
import { SettingsBackButton } from './SettingsSubpageHeader';
import {
  getPrivacyPreferences,
  PRIVACY_SETTINGS,
  togglePrivacyPreference,
} from '../../utils/privacyPreference';
import { privacyAssets } from '../../utils/privacyAssets';
import { settingsAssets } from '../../utils/settingsAssets';
import SettingsSubpageHeader from './SettingsSubpageHeader';

function PrivacyToggle({ enabled, onToggle, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${label} ${enabled ? 'on' : 'off'}`}
      className={`privacy-toggle${enabled ? ' privacy-toggle--on' : ' privacy-toggle--off'}`}
      onClick={onToggle}
    >
      {enabled ? <span className="privacy-toggle-label">ON</span> : null}
      <span className="privacy-toggle-thumb" aria-hidden="true" />
    </button>
  );
}

export default function PrivacyPreferencePage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(getPrivacyPreferences);

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  function handleToggle(settingId) {
    setPreferences(togglePrivacyPreference(settingId));
  }

  return (
    <div className="settings-page privacy-page">
      {/* <header className="settings-hero settings-hero--privacy">
        <div className="settings-hero-deco" aria-hidden="true">
          <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="Decorative hero mask" />
          <img className="privacy-hero-grid" src={settingsAssets.grid} alt="Decorative pixel grid background" />
          <img className="privacy-hero-wave" src={privacyAssets.vector552} alt="Decorative wave illustration" />
          <img className="privacy-hero-icon" src={privacyAssets.privacyPageIcon} alt="Privacy page icon" />
        </div>

        <div className="settings-title-row">
          <SettingsBackButton onClick={handleBack} label="Back to settings" />
          <h1 className="settings-title">
            <span className="settings-title-highlight settings-title-highlight--privacy" aria-hidden="true" />
            Privacy
          </h1>
        </div>
      </header> */}

      <SettingsSubpageHeader
              title="Privacy"
              onBack={handleBack}
              backLabel="Back to settings"
              titleIcon={<img src={settingsAssets.privacyIcon} alt="Privacy icon" />}
            />

      <div className="privacy-content">
        <h2 className="privacy-section-label"><span className="privacy-section-label-underline" />Permissions &amp; Data</h2>

        <div className="privacy-options-box">
          {PRIVACY_SETTINGS.map((setting, index) => {
            const enabled = preferences[setting.id];
            const iconSrc = privacyAssets[setting.iconKey];

            return (
              <div
                key={setting.id}
                className={`privacy-option${index < PRIVACY_SETTINGS.length - 1 ? ' privacy-option--bordered' : ''}`}
              >
                <img className="privacy-option-icon" src={iconSrc} alt="Privacy option icon" aria-hidden="true" />
                <div className="privacy-option-copy">
                  <span className="privacy-option-label">{setting.label}</span>
                  <span className="privacy-option-description">{setting.description}</span>
                </div>
                <PrivacyToggle
                  enabled={enabled}
                  label={setting.label}
                  onToggle={() => handleToggle(setting.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
