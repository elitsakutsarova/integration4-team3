// username field for account settings

import { useEffect, useRef, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { applySignedInUser, getAuthSnapshot } from '../../utils/authSession';
import { accountErrorToFieldMap, validateAccountFormData } from '../../utils/accountFormValidation';
import { paths } from '../../utils/appPaths';
import ConfirmCheckIcon from './ConfirmCheckIcon';
import EditPenIcon from './EditPenIcon';

function stripAt(username) {
  return String(username ?? '').replace(/^@+/, '') || 'user';
}

function fieldErrorsFromAction(data) {
  return accountErrorToFieldMap(data?.error);
}

export default function UsernameField({ username }) {
  return <UsernameFieldEditor key={stripAt(username)} username={username} />;
}

function UsernameFieldEditor({ username }) {
  const { user } = useAuth();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const inputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stripAt(username));
  const [clientErrors, setClientErrors] = useState({});

  const savedValue = stripAt(username);
  const isDirty = draft.trim().toLowerCase() !== savedValue.toLowerCase();
  const serverErrors = fieldErrorsFromAction(fetcher.data);
  const fieldError = clientErrors.username || serverErrors.username || serverErrors.form;
  const saving = fetcher.state !== 'idle';

  // On successful username save: update auth snapshot and exit edit mode.
  useEffect(() => {
    if (!fetcher.data?.success || fetcher.data?.kind !== 'username') return;

    const current = getAuthSnapshot().user;
    if (current && fetcher.data.user?.username) {
      applySignedInUser({ ...current, username: fetcher.data.user.username });
    }
    revalidate();
    setEditing(false);
    setClientErrors({});
  }, [fetcher.data]);

  function startEditing() {
    setDraft(savedValue);
    setEditing(true);
    setClientErrors({});
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handlePenClick() {
    if (editing && !isDirty) {
      setEditing(false);
      setDraft(savedValue);
      setClientErrors({});
      return;
    }
    startEditing();
  }

  function handleDraftChange(event) {
    setDraft(event.target.value.replace(/^@+/, '').toLowerCase());
    setClientErrors({});
  }

  function handleConfirm() {
    const formData = new FormData();
    formData.set('intent', 'change-username');
    formData.set('username', draft);

    const validation = validateAccountFormData(formData, user);
    if (validation.error) {
      setClientErrors(accountErrorToFieldMap(validation.error));
      return;
    }

    setClientErrors({});
    fetcher.submit(formData, { method: 'post', action: paths.apiAccount });
  }

  return (
    <div className="account-details-field account-details-field--username">
      <div className="account-details-field-main">
        <span className="account-details-field-label">Username</span>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            className={`account-details-username-input${fieldError ? ' account-details-username-input--error' : ''}`}
            value={draft}
            onChange={handleDraftChange}
            autoComplete="username"
            aria-invalid={Boolean(fieldError)}
            disabled={saving}
          />
        ) : (
          <span className="account-details-field-value">{savedValue}</span>
        )}
        {fieldError ? <p className="auth-field-error">{fieldError}</p> : null}
      </div>

      {isDirty ? (
        <button
          type="button"
          className="account-details-edit account-details-edit--confirm"
          onClick={handleConfirm}
          disabled={saving}
          aria-label="Save username"
        >
          <ConfirmCheckIcon />
        </button>
      ) : (
        <button
          type="button"
          className="account-details-edit"
          onClick={handlePenClick}
          disabled={saving}
          aria-label={editing ? 'Cancel editing username' : 'Edit username'}
        >
          <EditPenIcon />
        </button>
      )}
    </div>
  );
}
