import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { paths } from '../../utils/appPaths';
import { goBack } from '../../utils/appPaths';
import { getLanguageLabel, getLanguagePreference } from '../../utils/languagePreference';
import { settingsAssets } from '../../utils/settingsAssets';
import LogoutConfirmModal from './LogoutConfirmModal';

function SettingsRowIcon({ children }) {
  return <span className="settings-row-icon">{children}</span>;
}

function SettingsChevron() {
  return (
    <svg
      className="settings-row-chevron"
      width="8"
      height="14"
      viewBox="0 0 8 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1l6 6-6 6"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsRow({ icon, label, trailing, onClick, to, danger = false, showChevron = true }) {
  const className = `settings-row${danger ? ' settings-row--danger' : ''}`;
  const content = (
    <>
      <SettingsRowIcon>{icon}</SettingsRowIcon>
      <span className="settings-row-label">{label}</span>
      {trailing ? <span className="settings-row-trailing">{trailing}</span> : null}
      {showChevron ? <SettingsChevron /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const languageLabel = getLanguageLabel(getLanguagePreference());

  function handleBack() {
    goBack(navigate, paths.profile);
  }

  async function handleConfirmLogout() {
    setLogoutOpen(false);
    await signOut();
  }

  return (
    <div className="settings-page">
      <header className="settings-hero">
        <div className="settings-hero-deco" aria-hidden="true">
          <img className="settings-hero-mask" src={settingsAssets.maskGroup} alt="" />
          <img className="settings-hero-grid" src={settingsAssets.topGrid} alt="" />
          <img className="settings-hero-wave" src={settingsAssets.vector507} alt="" />
          <img className="settings-hero-star settings-hero-star--mint" src={settingsAssets.group6190} alt="" />
          <img className="settings-hero-star settings-hero-star--blue" src={settingsAssets.group6191} alt="" />
          <img className="settings-hero-sparkle" src={settingsAssets.group5691} alt="" />
        </div>

        <div className="settings-title-row">
          <button
            type="button"
            className="settings-back-btn"
            onClick={handleBack}
            aria-label="Back to profile"
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
          <h1 className="settings-title">
            <span className="settings-title-highlight" aria-hidden="true" />
            Settings
          </h1>
        </div>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h2 className="settings-section-label">
            <span className="settings-section-underline" aria-hidden="true" />
            Preferences
          </h2>

          <div className="settings-section-box">
            <SettingsRow
              label="Account Details"
              to={paths.profileSettingsAccount}
              icon={(
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
                  <circle cx="9" cy="5" r="4" stroke="#1e1e1e" strokeWidth="1.5" />
                  <path
                    d="M1 19c0-4.418 3.582-8 8-8s8 3.582 8 8"
                    stroke="#1e1e1e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            />
            <SettingsRow
              label="Language"
              trailing={languageLabel}
              to={paths.profileSettingsLanguage}
              icon={(
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.25" stroke="#1e1e1e" strokeWidth="1.5" />
                  <path
                    d="M1.75 10h16.5"
                    stroke="#1e1e1e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            />
            <SettingsRow
              label="Privacy"
              icon={(
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
                  <rect x="3" y="8" width="12" height="10" rx="2" stroke="#1e1e1e" strokeWidth="1.5" />
                  <path
                    d="M5 8V6a4 4 0 0 1 8 0v2"
                    stroke="#1e1e1e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-label">
            <span className="settings-section-underline settings-section-underline--short" aria-hidden="true" />
            Other
          </h2>

          <div className="settings-section-box settings-section-box--compact">
            <SettingsRow
              label="Support & Help"
              icon={(
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.25" stroke="#1e1e1e" strokeWidth="1.5" />
                  <path
                    d="M7.75 7.5a2.25 2.25 0 0 1 4.07 1.35c0 1.35-2.07 1.65-2.07 3.15"
                    stroke="#1e1e1e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="14.25" r="0.9" fill="#1e1e1e" />
                </svg>
              )}
            />
            <SettingsRow
              label="Log Out"
              danger
              showChevron={false}
              onClick={() => setLogoutOpen(true)}
              icon={<img src={settingsAssets.logoutGlyph} alt="" width="20" height="18" />}
            />
          </div>
        </section>
      </div>

      {logoutOpen ? (
        <LogoutConfirmModal
          onCancel={() => setLogoutOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      ) : null}
    </div>
  );
}
