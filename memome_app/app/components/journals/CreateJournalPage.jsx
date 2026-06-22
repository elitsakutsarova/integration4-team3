import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router';
import { useCreateJournal, useCustomJournals } from '../../context/CreateJournalContext';
import { useCreatedMemos } from '../../context/CreatedMemosContext';
import { paths } from '../../utils/appPaths';
import { buildCustomJournalId } from '../../utils/customJournalStore';
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  clearCreateJournalDraft,
  isCreateJournalDraftComplete,
  localTodayIsoDate,
  validateCreateJournalDraft,
} from '../../utils/createJournalDraft';
import CreateJournalDecorations from './CreateJournalDecorations';
import CreateJournalWarningModal from './CreateJournalWarningModal';
import { CalendarIcon, JournalMemoMiniCard } from './JournalMemoPickCard';

const CREATE_FLOW_PATHS = new Set([paths.journalsCreate, paths.journalsCreateMemos]);

function DateField({ id, value, onChange, hasError, max }) {
  const inputRef = useRef(null);
  const maxDate = max ?? localTodayIsoDate();

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  return (
    <label
      className={`create-journal-date-field${hasError ? ' create-journal-field--error' : ''}`}
      htmlFor={id}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      }}
    >
      <span className="create-journal-date-display">
        {value
          ? new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Pick date'}
      </span>
      <span className="create-journal-date-icon" aria-hidden="true">
        <CalendarIcon />
      </span>
      <input
        ref={inputRef}
        id={id}
        type="date"
        className="create-journal-date-input"
        value={value}
        max={maxDate}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default function CreateJournalPage() {
  const navigate = useNavigate();
  const { draft, setDraft, resetDraft, isDirty } = useCreateJournal();
  const { createdMemos } = useCreatedMemos();
  const { saveCustomJournal } = useCustomJournals();
  const [showErrors, setShowErrors] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const leaveTargetRef = useRef(paths.journals);
  const isSubmittingRef = useRef(false);
  const isDiscardingRef = useRef(false);

  const errors = useMemo(
    () => (showErrors ? validateCreateJournalDraft(draft) : {}),
    [draft, showErrors],
  );

  const selectedMemos = useMemo(
    () => draft.selectedMemoIds
      .map((id) => createdMemos.find((memo) => memo.id === id))
      .filter(Boolean),
    [createdMemos, draft.selectedMemoIds],
  );

  const canCreate = isCreateJournalDraftComplete(draft);

  const blocker = useBlocker(
    ({ nextLocation }) =>
      !isSubmittingRef.current
      && !isDiscardingRef.current
      && isDirty
      && !CREATE_FLOW_PATHS.has(nextLocation.pathname),
  );

  // Reset submit guard on mount so useBlocker is not stuck from a prior visit.
  useEffect(() => {
    isSubmittingRef.current = false;
  }, []);

  // useBlocker cannot open UI directly — sync blocked navigation to the warning modal.
  useEffect(() => {
    if (blocker.state === 'blocked') {
      leaveTargetRef.current = blocker.location?.pathname ?? paths.journals;
      setWarningOpen(true);
    }
  }, [blocker.state, blocker.location?.pathname]);

  function updateField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function removeMemo(memoId) {
    setDraft((prev) => ({
      ...prev,
      selectedMemoIds: prev.selectedMemoIds.filter((id) => id !== memoId),
    }));
  }

  function handleBack() {
    if (!isDirty) {
      navigate(paths.journals);
      return;
    }
    leaveTargetRef.current = paths.journals;
    setWarningOpen(true);
  }

  function handleContinueEditing() {
    setWarningOpen(false);
    if (blocker.state === 'blocked') blocker.reset();
  }

  function handleDiscard() {
    isDiscardingRef.current = true;
    resetDraft();
    setWarningOpen(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
      return;
    }
    navigate(leaveTargetRef.current);
  }

  function handleCreate() {
    setShowErrors(true);
    if (!isCreateJournalDraftComplete(draft)) return;

    const journal = {
      id: buildCustomJournalId(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate || draft.startDate,
      memoIds: [...draft.selectedMemoIds],
      createdAt: new Date().toISOString(),
    };

    const saved = saveCustomJournal(journal);
    if (!saved) return;

    isSubmittingRef.current = true;
    clearCreateJournalDraft();
    resetDraft();
    navigate(paths.journals);
  }

  return (
    <>
      <CreateJournalDecorations
        title="Create Journal"
        onBack={handleBack}
        backLabel="Back to journals"
      />

      <div className="create-journal-form">
        <div className="create-journal-field">
          <label className={`create-journal-label${errors.title ? ' create-journal-label--error' : ''}`} htmlFor="journal-title">
            Title*
          </label>
          <input
            id="journal-title"
            className={`create-journal-input${errors.title ? ' create-journal-field--error' : ''}`}
            value={draft.title}
            maxLength={TITLE_MAX}
            placeholder="Weekends Getaway"
            onChange={(event) => updateField('title', event.target.value)}
          />
          {errors.title && <p className="create-journal-error">{errors.title}</p>}
          <p className="create-journal-hint">
            <span>{draft.title.length}/{TITLE_MAX} characters used</span>
            <span>max. {TITLE_MAX} characters</span>
          </p>
        </div>

        <div className="create-journal-field">
          <label className={`create-journal-label${errors.description ? ' create-journal-label--error' : ''}`} htmlFor="journal-description">
            Description
          </label>
          <textarea
            id="journal-description"
            className={`create-journal-textarea${errors.description ? ' create-journal-field--error' : ''}`}
            value={draft.description}
            maxLength={DESCRIPTION_MAX}
            placeholder="Trip with friends to Antwerp. Lots of laughs, fun had, clubbing and treats had."
            onChange={(event) => updateField('description', event.target.value)}
          />
          {errors.description && <p className="create-journal-error">{errors.description}</p>}
          <p className="create-journal-hint">
            <span>{draft.description.length}/{DESCRIPTION_MAX} characters used</span>
            <span>max. {DESCRIPTION_MAX} characters</span>
          </p>
        </div>

        <div className="create-journal-field">
          <span className={`create-journal-label${errors.startDate ? ' create-journal-label--error' : ''}`}>
            Dates of trip*
          </span>
          <div className="create-journal-dates">
            <DateField
              id="journal-start-date"
              value={draft.startDate}
              hasError={Boolean(errors.startDate)}
              onChange={(value) => updateField('startDate', value)}
            />
            <span className="create-journal-dates-sep" aria-hidden="true">-</span>
            <DateField
              id="journal-end-date"
              value={draft.endDate}
              hasError={Boolean(errors.endDate)}
              onChange={(value) => updateField('endDate', value)}
            />
          </div>
          {errors.startDate && <p className="create-journal-error">{errors.startDate}</p>}
          {errors.endDate && <p className="create-journal-error">{errors.endDate}</p>}
        </div>
      </div>

      <section className="create-journal-memories" aria-labelledby="create-journal-memories-heading">
        <div className="create-journal-memories-head">
          <h2 id="create-journal-memories-heading" className="create-journal-memories-title">Memories</h2>
          {selectedMemos.length > 0 && (
            <Link to={paths.journalsCreateMemos} className="create-journal-memories-add" aria-label="Add more memos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </Link>
          )}
        </div>

        {selectedMemos.length === 0 ? (
          <div className="create-journal-memories-empty">
            <p>Choose which memories you want to look back on!</p>
            <Link to={paths.journalsCreateMemos} className="create-journal-add-memos-btn">
              Add memos
            </Link>
            {errors.memos && <p className="create-journal-error create-journal-error--center">{errors.memos}</p>}
          </div>
        ) : (
          <div className="create-journal-memories-strip">
            {selectedMemos.map((memo) => (
              <JournalMemoMiniCard
                key={memo.id}
                memo={memo}
                onRemove={() => removeMemo(memo.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="create-journal-footer">
        <button
          type="button"
          className={`create-journal-submit${canCreate ? ' create-journal-submit--active' : ''}`}
          onClick={handleCreate}
        >
          Create Journal
        </button>
      </div>

      <CreateJournalWarningModal
        open={warningOpen}
        onContinue={handleContinueEditing}
        onDiscard={handleDiscard}
      />
    </>
  );
}
