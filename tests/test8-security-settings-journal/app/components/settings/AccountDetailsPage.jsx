// account details page for account settings

import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { paths } from '../../utils/appPaths';
import { goBack } from '../../utils/appPaths';
import { settingsAssets } from '../../utils/settingsAssets';
import EditPenIcon from './EditPenIcon';
import SettingsSubpageHeader from './SettingsSubpageHeader';
import UsernameField from './UsernameField';

function AccountField({ label, value, editTo }) {
  return (
    <div className="account-details-field">
      <div className="account-details-field-main">
        <span className="account-details-field-label">{label}</span>
        <span className="account-details-field-value">{value}</span>
      </div>
      {editTo ? (
        <Link to={editTo} className="account-details-edit" aria-label={`Edit ${label.toLowerCase()}`}>
          <EditPenIcon />
        </Link>
      ) : null}
    </div>
  );
}

const SUCCESS_MESSAGES = {
  password: 'Your password was updated. Sign in with your new password next time.',
  email: 'Your email was updated successfully.',
  username: 'Your username was updated successfully.',
};

export default function AccountDetailsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const updated = searchParams.get('updated');
  const successMessage = SUCCESS_MESSAGES[updated] ?? null;

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  function dismissSuccess() {
    const next = new URLSearchParams(searchParams);
    next.delete('updated');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="settings-page account-details-page">
      <SettingsSubpageHeader
        title="Account Details"
        onBack={handleBack}
        backLabel="Back to settings"
      />

      <div className="account-details-content">
        <section className="account-details-avatar-section">
          <div className="account-details-avatar-wrap">
            <img
              className="account-details-avatar"
              src={settingsAssets.avatarPlaceholder}
              alt=""
            />
            <span className="account-details-avatar-edit" aria-hidden="true">
              <EditPenIcon />
            </span>
          </div>
          <button type="button" className="account-details-avatar-link" disabled>
            Change avatar
          </button>
        </section>

        {successMessage ? (
          <div className="account-details-banner" role="status">
            <p>{successMessage}</p>
            <button type="button" className="account-details-banner-dismiss" onClick={dismissSuccess}>
              Dismiss
            </button>
          </div>
        ) : null}

        <section className="settings-section account-details-section">
          <h2 className="settings-section-label">
            <span className="settings-section-underline settings-section-underline--details" aria-hidden="true" />
            Details
          </h2>

          <div className="account-details-card">
            <UsernameField username={user?.username} />
            <AccountField
              label="E-mail"
              value={user?.email ?? '—'}
              editTo={paths.profileSettingsChangeEmail}
            />
            <AccountField
              label="Password"
              value="****************"
              editTo={paths.profileSettingsChangePassword}
            />
          </div>
        </section>

        <section className="settings-section account-details-section">
          <h2 className="settings-section-label">
            <span className="settings-section-underline settings-section-underline--actions" aria-hidden="true" />
            Actions
          </h2>

          <div className="account-details-card account-details-card--actions">
            <button type="button" className="account-details-delete" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
                  stroke="#ff2727"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Delete account</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
