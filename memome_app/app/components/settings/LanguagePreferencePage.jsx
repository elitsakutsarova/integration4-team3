// settings page for changing the app language

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { goBack, paths } from '../../utils/appPaths';
import { SettingsBackButton } from './SettingsSubpageHeader';
import {
  getLanguagePreference,
  LANGUAGE_OPTIONS,
  setLanguagePreference,
} from '../../utils/languagePreference';
import { settingsAssets } from '../../utils/settingsAssets';

function LanguageRadio({ selected }) {
  if (selected) {
    return (
      <span className="language-radio language-radio--selected" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6l2.5 2.5 4.5-5"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return <span className="language-radio" aria-hidden="true" />;
}

export default function LanguagePreferencePage() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguagePreference);

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  function handleSelect(languageId) {
    setSelectedLanguage(languageId);
    setLanguagePreference(languageId);
  }

  return (
    <div className="settings-page language-page">
      <header className="settings-hero settings-hero--language">
        <div className="settings-hero-deco" aria-hidden="true">
          <img className="language-hero-grid" src={settingsAssets.grid} alt="" />
          <img className="language-hero-grid language-hero-grid--left" src={settingsAssets.topGrid2} alt="" />
          <img className="language-hero-grid language-hero-grid--right" src={settingsAssets.topGrid3} alt="" />
          <img className="language-hero-wave" src={settingsAssets.vector519} alt="" />
          <img className="language-hero-star" src={settingsAssets.star21} alt="" />
          <img className="language-hero-icon" src={settingsAssets.languageIcon} alt="" />
        </div>

        <div className="settings-title-row">
          <SettingsBackButton onClick={handleBack} label="Back to settings" />
          <h1 className="settings-title">
            <span className="settings-title-highlight settings-title-highlight--language" aria-hidden="true" />
            Language
          </h1>
        </div>
      </header>

      <div className="language-content">
        <p className="language-intro">
          Choose the language you want to use for the MemoMe app interface.
        </p>

        <div className="language-options-box" role="radiogroup" aria-label="App language">
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = selectedLanguage === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`language-option${selected ? ' language-option--selected' : ''}`}
                onClick={() => handleSelect(option.id)}
              >
                <span className="language-option-label">{option.label}</span>
                <LanguageRadio selected={selected} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
