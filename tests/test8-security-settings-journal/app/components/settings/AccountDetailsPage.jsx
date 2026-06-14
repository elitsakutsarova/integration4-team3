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

  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'delete-account') return;

    async function finishDelete() {
      setDeleteModalOpen(false);
      setDeleteError('');
      await signOut();
      navigate(paths.home, { replace: true });
    }

    void finishDelete();
  }, [fetcher.data, navigate, signOut]);

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
              <EditPenIcon />
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
