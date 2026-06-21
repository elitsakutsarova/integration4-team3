// account details page for account settings

import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useUserAvatar } from '../../hooks/useUserAvatar';
import { goBack, paths } from '../../utils/appPaths';
import {
  clearUserAvatar,
  readAvatarDataUrl,
  setUserAvatar,
} from '../../utils/userAvatarStore';
import { settingsAssets } from '../../utils/settingsAssets';
import AvatarSuccessModal from './AvatarSuccessModal';
import DeleteAccountConfirmModal from './DeleteAccountConfirmModal';
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
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const fileInputRef = useRef(null);
  const avatarUrl = useUserAvatar(user?.id);
  const [avatarError, setAvatarError] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const deleting = fetcher.state !== 'idle';
  const updated = searchParams.get('updated');
  const successMessage = SUCCESS_MESSAGES[updated] ?? null;
  const hasCustomAvatar = Boolean(avatarUrl);

  // After account deletion succeeds: sign out and return to the map.
  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'delete-account') return;

    async function finishDelete() {
      setDeleteModalOpen(false);
      setDeleteError('');
      await signOut();
      navigate(paths.loggedOut, { replace: true });
    }

    void finishDelete();
  }, [fetcher.data, navigate, signOut]);

  // Surface delete-account API errors inside the confirmation modal.
  useEffect(() => {
    if (!fetcher.data?.error || fetcher.data?.success) return;
    setDeleteError(fetcher.data.error.message ?? 'Could not delete your account.');
  }, [fetcher.data]);

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  function dismissSuccess() {
    const next = new URLSearchParams(searchParams);
    next.delete('updated');
    setSearchParams(next, { replace: true });
  }

  function openFilePicker() {
    setAvatarError('');
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !user?.id) return;

    const result = await readAvatarDataUrl(file);
    if (result.error) {
      setAvatarError(result.error.message);
      return;
    }

    setUserAvatar(user.id, result.dataUrl);
    setAvatarError('');
    setSuccessModalOpen(true);
  }

  function handleRemoveAvatar() {
    if (!user?.id) return;
    clearUserAvatar(user.id);
    setAvatarError('');
    setSuccessModalOpen(false);
  }

  function openDeleteModal() {
    setDeleteError('');
    setDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    if (!user?.id || deleting) return;

    const formData = new FormData();
    formData.set('intent', 'delete-account');
    fetcher.submit(formData, { method: 'post', action: paths.apiAccount });
  }

  return (
    <div className="settings-page account-details-page">
      <SettingsSubpageHeader
        title="Account Details"
        onBack={handleBack}
        backLabel="Back to settings"
        titleIcon={<img src={settingsAssets.greenStar} alt="Star shape looking like gear" />}
      />

      <div className="account-details-content">
        <section className="account-details-avatar-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="account-details-avatar-input"
            onChange={handleAvatarChange}
          />

          <button
            type="button"
            className="account-details-avatar-wrap"
            onClick={openFilePicker}
            aria-label="Change avatar"
          >
            <img
              className={`account-details-avatar${hasCustomAvatar ? ' account-details-avatar--photo' : ' account-details-avatar--placeholder'}`}
              src={hasCustomAvatar ? avatarUrl : settingsAssets.avatarPlaceholder}
              alt=""
            />
            <span className="account-details-avatar-edit" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
                <path d="M17.6179 11.1913L15.971 9.61559L5.12258 19.9947V21.5704H6.76952L17.6179 11.1913ZM19.2649 9.61559L20.9118 8.03989L19.2649 6.46418L17.6179 8.03989L19.2649 9.61559ZM7.73393 23.7992H2.79309V19.0709L18.4414 4.09951C18.6598 3.8906 19.1238 3.44594 19.2592 3.31641C19.53 3.57547 19.8699 3.8906 20.0884 4.09951L23.3834 7.25203C23.6018 7.46101 23.9361 7.78083 24.2069 8.03989C23.9361 8.29894 23.6018 8.61876 23.3834 8.82774L7.73393 23.7992Z" fill="#1952FF" />
              </svg>
            </span>
          </button>

          <button type="button" className="account-details-avatar-link" onClick={openFilePicker}>
            Change avatar
          </button>

          {hasCustomAvatar ? (
            <button
              type="button"
              className="account-details-avatar-remove"
              onClick={handleRemoveAvatar}
            >
              Remove photo
            </button>
          ) : null}

          {avatarError ? (
            <p className="account-details-avatar-error" role="alert">
              {avatarError}
            </p>
          ) : null}
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
            <button type="button" className="account-details-delete" onClick={openDeleteModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
  <path d="M5.625 0V1.11111H0V3.33333H1.125V17.7778C1.125 18.3671 1.36205 18.9324 1.78401 19.3491C2.20597 19.7659 2.77826 20 3.375 20H14.625C15.2217 20 15.794 19.7659 16.216 19.3491C16.6379 18.9324 16.875 18.3671 16.875 17.7778V3.33333H18V1.11111H12.375V0H5.625ZM3.375 3.33333H14.625V17.7778H3.375V3.33333ZM5.625 5.55556V15.5556H7.875V5.55556H5.625ZM10.125 5.55556V15.5556H12.375V5.55556H10.125Z" fill="#FF4400"/>
</svg>
              <span>Delete account</span>
            </button>
            {deleteError ? (
              <p className="account-details-delete-error" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {successModalOpen ? (
        <AvatarSuccessModal onClose={() => setSuccessModalOpen(false)} />
      ) : null}

      {deleteModalOpen ? (
        <DeleteAccountConfirmModal
          busy={deleting}
          onCancel={() => {
            if (!deleting) setDeleteModalOpen(false);
          }}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  );
}
