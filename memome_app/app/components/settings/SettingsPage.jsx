// main Settings screen -> from here the user navigates to the other settings pages

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { paths, goBack } from '../../utils/appPaths';
import { getLanguageLabel, getLanguagePreference } from '../../utils/languagePreference';
import { settingsAssets } from '../../utils/settingsAssets';
import LogoutConfirmModal from './LogoutConfirmModal';
import { SettingsBackButton } from './SettingsSubpageHeader';

function SettingsRowIcon({ children }) {
  return <span className="settings-row-icon">{children}</span>;
}

function SettingsChevron() {
  return (
    <svg className="settings-row-chevron" xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.72168 7.22211L1.34415 13L0 11.5558L4.70546 6.5L0 1.44422L1.34415 0L6.72168 5.77789C6.89989 5.96943 7 6.22917 7 6.5C7 6.77083 6.89989 7.03057 6.72168 7.22211Z" fill="#797979" />
    </svg>
  );
}

function SettingsRow({ icon, label, trailing, onClick, to, danger = false, showChevron = true }) {
  const className = `settings-row${danger ? ' settings-row--danger' : ''}`;
  const content = (
    <>
      <SettingsRowIcon>{icon}</SettingsRowIcon>
      <span className="settings-row-label">{label}</span>
      {(trailing || showChevron) && (
        <span className="settings-row-right">
          {trailing && (
            <span className="settings-row-trailing">
              {trailing}
            </span>
          )}

          {showChevron && <SettingsChevron />}
        </span>
      )}
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
    navigate(paths.loggedOut, { replace: true });
  }

  return (
    <div className="settings-page">
      <header className="settings-hero header">
        <div className="settings-hero-deco" aria-hidden="true">
          <img className="settings-hero-grid" src={settingsAssets.greenGrid} alt="" />
          <div className="settings-hero-grid-pattern grid-pattern" />
        </div>

        <div className="settings-title-row title-row">
          <div className="settings-titles titles">
          <SettingsBackButton className="btn-chevron" onClick={handleBack} label="Back to profile" />
          <h1 className="settings-title title">
            Settings
          </h1>
        </div>
          <div className="settings-title-icon grid-icon">
            <img src={settingsAssets.blueGears} alt="Settings" />
          </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M8.66667 2.16667C9.85833 2.16667 10.8333 3.14167 10.8333 4.33333C10.8333 5.525 9.85833 6.5 8.66667 6.5C7.475 6.5 6.5 5.525 6.5 4.33333C6.5 3.14167 7.475 2.16667 8.66667 2.16667ZM8.66667 12C11.5917 12 14.95 14.3975 15.1667 15.1667H2.16667C2.41583 14.3867 5.7525 12 8.66667 12ZM8.66667 0C6.2725 0 4.33333 1.93917 4.33333 4.33333C4.33333 6.7275 6.2725 8.66667 8.66667 8.66667C11.0608 8.66667 13 6.7275 13 4.33333C13 1.93917 11.0608 0 8.66667 0ZM8.66667 10C5.77417 10 0 12.285 0 15.1667V17.3333H17.3333V15.1667C17.3333 12.285 11.5592 10 8.66667 10Z" fill="#797979" />
                </svg>
              )}
            />
            <SettingsRow
              label="Language"
              trailing={languageLabel}
              to={paths.profileSettingsLanguage}
              icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                  <path d="M1 9.40129C1 13.9502 4.68737 17.6375 9.23625 17.6375C13.7851 17.6375 17.4725 13.9502 17.4725 9.40129C17.4725 4.85241 13.7851 1.16504 9.23625 1.16504C4.68737 1.16504 1 4.85241 1 9.40129Z" stroke="#797979" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.0599 1.20605C10.0599 1.20605 12.5308 4.45937 12.5308 9.40112C12.5308 14.3429 10.0599 17.5962 10.0599 17.5962M8.41263 17.5962C8.41263 17.5962 5.94176 14.3429 5.94176 9.40112C5.94176 4.45937 8.41263 1.20605 8.41263 1.20605M1.51889 12.2838H16.9536M1.51889 6.51844H16.9536" stroke="#797979" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
            <SettingsRow
              label="Privacy"
              to={paths.profileSettingsPrivacy}
              icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="20" viewBox="0 0 15 20" fill="none">
                  <path d="M0 20V6.66667H2.8125V4.76191C2.8125 3.44444 3.26969 2.32159 4.18406 1.39333C5.09844 0.46508 6.20375 0.000635571 7.5 6.50089e-07C8.79625 -0.000634271 9.90188 0.46381 10.8169 1.39333C11.7319 2.32286 12.1888 3.44571 12.1875 4.76191V6.66667H15V20H0ZM1.875 18.0952H13.125V8.57143H1.875V18.0952ZM4.6875 6.66667H10.3125V4.76191C10.3125 3.96825 10.0391 3.29365 9.49219 2.7381C8.94531 2.18254 8.28125 1.90476 7.5 1.90476C6.71875 1.90476 6.05469 2.18254 5.50781 2.7381C4.96094 3.29365 4.6875 3.96825 4.6875 4.76191V6.66667Z" fill="#797979" />
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
              to={paths.profileSettingsFeedback}
              icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M8.1 14.4H9.9V12.6H8.1V14.4ZM9 0C7.8181 0 6.64778 0.232792 5.55585 0.685084C4.46392 1.13738 3.47177 1.80031 2.63604 2.63604C0.948211 4.32387 0 6.61305 0 9C0 11.3869 0.948211 13.6761 2.63604 15.364C3.47177 16.1997 4.46392 16.8626 5.55585 17.3149C6.64778 17.7672 7.8181 18 9 18C11.3869 18 13.6761 17.0518 15.364 15.364C17.0518 13.6761 18 11.3869 18 9C18 7.8181 17.7672 6.64778 17.3149 5.55585C16.8626 4.46392 16.1997 3.47177 15.364 2.63604C14.5282 1.80031 13.5361 1.13738 12.4442 0.685084C11.3522 0.232792 10.1819 0 9 0ZM9 16.2C5.031 16.2 1.8 12.969 1.8 9C1.8 5.031 5.031 1.8 9 1.8C12.969 1.8 16.2 5.031 16.2 9C16.2 12.969 12.969 16.2 9 16.2ZM9 3.6C8.04522 3.6 7.12955 3.97928 6.45442 4.65442C5.77928 5.32955 5.4 6.24522 5.4 7.2H7.2C7.2 6.72261 7.38964 6.26477 7.72721 5.92721C8.06477 5.58964 8.52261 5.4 9 5.4C9.47739 5.4 9.93523 5.58964 10.2728 5.92721C10.6104 6.26477 10.8 6.72261 10.8 7.2C10.8 9 8.1 8.775 8.1 11.7H9.9C9.9 9.675 12.6 9.45 12.6 7.2C12.6 6.24522 12.2207 5.32955 11.5456 4.65442C10.8705 3.97928 9.95478 3.6 9 3.6Z" fill="#797979" />
                </svg>
              )}
            />
            <SettingsRow
              label="Log Out"
              danger
              showChevron={false}
              onClick={() => setLogoutOpen(true)}
              icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M0 15V0H7.5V1.66667H1.66667V13.3333H7.5V15H0ZM10.8333 11.6667L9.6875 10.4583L11.8125 8.33333H5V6.66667H11.8125L9.6875 4.54167L10.8333 3.33333L15 7.5L10.8333 11.6667Z" fill="#797979" />
                </svg>
              )}
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
