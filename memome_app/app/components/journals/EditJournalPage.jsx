import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router';
import { useCustomJournals } from '../../context/CreateJournalContext';
import { useCreatedMemos } from '../../context/CreatedMemosContext';
import { useEditJournal } from '../../context/EditJournalContext';
import { diaryPath, paths } from '../../utils/appPaths';
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  formatCustomJournalDateRange,
} from '../../utils/createJournalDraft';
import {
  buildEditDraftFromJournal,
  buildPersistedJournalRecord,
  clearEditJournalDraft,
  isEditJournalDraftComplete,
  loadEditJournalDraft,
  validateEditJournalDraft,
} from '../../utils/editJournalDraft';
import { journalAssets } from '../../utils/journalAssets';
import JournalBackButton from './JournalBackButton';
import CreateJournalWarningModal from './CreateJournalWarningModal';
import DeleteJournalWarningModal from './DeleteJournalWarningModal';
import EditJournalMemoRow from './EditJournalMemoRow';
import { useEditJournalMemoReorder } from '../../hooks/useEditJournalMemoReorder';

const DESCRIPTION_ROW_ID = 'description';

function buildEditFlowPaths(journalId) {
  return new Set([
    paths.journalsEdit(journalId),
    paths.journalsEditMemos(journalId),
  ]);
}

function memoLayout(index, memo) {
  if (!memo.mediaPreview?.url) return 'text';
  if (index % 2 === 1) return 'right';
  return 'left';
}

function normalizeMemoId(id) {
  return String(id);
}

function countResolvedMemos(memoIds, memos) {
  const memoIdSet = new Set(memos.map((memo) => normalizeMemoId(memo.id)));
  return memoIds.filter((id) => memoIdSet.has(normalizeMemoId(id))).length;
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path d="M5.625 0V1.11111H0V3.33333H1.125V17.7778C1.125 18.3671 1.36205 18.9324 1.78401 19.3491C2.20597 19.7659 2.77826 20 3.375 20H14.625C15.2217 20 15.794 19.7659 16.216 19.3491C16.6379 18.9324 16.875 18.3671 16.875 17.7778V3.33333H18V1.11111H12.375V0H5.625ZM3.375 3.33333H14.625V17.7778H3.375V3.33333ZM5.625 5.55556V15.5556H7.875V5.55556H5.625ZM10.125 5.55556V15.5556H12.375V5.55556H10.125Z" fill="#FF4400" />
    </svg>
  );
}

export default function EditJournalPage({ journal }) {
  const navigate = useNavigate();
  const { draft, setDraft, initDraft, resetDraft, isDirty } = useEditJournal();
  const { createdMemos } = useCreatedMemos();
  const { patchCustomJournal, removeCustomJournal, saveCustomJournal } = useCustomJournals();
  const [showErrors, setShowErrors] = useState(false);
  const [leaveWarningOpen, setLeaveWarningOpen] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [selectedMemoRows, setSelectedMemoRows] = useState(() => new Set());
  const [editingTitle, setEditingTitle] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const leaveTargetRef = useRef(diaryPath(journal.id));
  const isSubmittingRef = useRef(false);
  const isDiscardingRef = useRef(false);
  const titleInputRef = useRef(null);
  const loadedJournalIdRef = useRef('');
  const preDeleteDraftRef = useRef(null);

  const editFlowPaths = useMemo(
    () => buildEditFlowPaths(journal.id),
    [journal.id],
  );

  const errors = useMemo(
    () => (showErrors ? validateEditJournalDraft(draft) : {}),
    [draft, showErrors],
  );

  const selectedMemos = useMemo(
    () => draft.selectedMemoIds
      .map((id) => createdMemos.find((memo) => normalizeMemoId(memo.id) === normalizeMemoId(id)))
      .filter(Boolean),
    [createdMemos, draft.selectedMemoIds],
  );

  const dateRange = useMemo(
    () => formatCustomJournalDateRange(draft.startDate, draft.endDate) || journal.dateRange,
    [draft.endDate, draft.startDate, journal.dateRange],
  );

  const hasDescription = Boolean(draft.description.trim());
  const showDescription = descriptionOpen || hasDescription;
  const isDescriptionSelected = selectedMemoRows.has(DESCRIPTION_ROW_ID);
  const canSave = isEditJournalDraftComplete(draft);

  const handleReorderMemos = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setDraft((prev) => {
      const ids = [...prev.selectedMemoIds];
      const [moved] = ids.splice(fromIndex, 1);
      ids.splice(toIndex, 0, moved);
      return { ...prev, selectedMemoIds: ids };
    });
  }, [setDraft]);

  const {
    setRowRef,
    draggingIndex,
    overIndex,
    getMenuPointerHandlers,
  } = useEditJournalMemoReorder({
    itemCount: selectedMemos.length,
    onReorder: handleReorderMemos,
  });

  const blocker = useBlocker(
    ({ nextLocation }) =>
      !isSubmittingRef.current
      && !isDiscardingRef.current
      && isDirty
      && !editFlowPaths.has(nextLocation.pathname),
  );

  // Reset submit guard on mount so useBlocker is not stuck from a prior visit.
  useEffect(() => {
    isSubmittingRef.current = false;
  }, []);

  // Hydrate edit draft from journal + localStorage when opening a different journal.
  useEffect(() => {
    if (loadedJournalIdRef.current === journal.id) return;
    loadedJournalIdRef.current = journal.id;

    const journalSnapshot = buildEditDraftFromJournal(journal);
    const saved = loadEditJournalDraft();
    const workingDraft = saved.journalId === journal.id ? saved : journalSnapshot;
    initDraft(workingDraft, journalSnapshot);
    setDescriptionOpen(Boolean(workingDraft.description.trim()));
  }, [initDraft, journal]);

  // useBlocker cannot open UI directly — sync blocked navigation to the warning modal.
  useEffect(() => {
    if (blocker.state === 'blocked') {
      leaveTargetRef.current = blocker.location?.pathname ?? paths.journals;
      setLeaveWarningOpen(true);
    }
  }, [blocker.state, blocker.location?.pathname]);

  // Focus the inline title field when the user enters title-edit mode.
  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  function updateField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleBack() {
    if (selectedMemoRows.size > 0) {
      setSelectedMemoRows(new Set());
      return;
    }

    if (!isDirty) {
      navigate(diaryPath(journal.id));
      return;
    }

    leaveTargetRef.current = diaryPath(journal.id);
    setLeaveWarningOpen(true);
  }

  function handleContinueEditing() {
    setLeaveWarningOpen(false);
    if (blocker.state === 'blocked') blocker.reset();
  }

  function handleDiscard() {
    isDiscardingRef.current = true;
    resetDraft();
    setLeaveWarningOpen(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
      return;
    }
    navigate(leaveTargetRef.current);
  }

  function toggleSelectedRow(rowId) {
    setSelectedMemoRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }

  function handleRemoveMemo(memoId) {
    const normalizedId = normalizeMemoId(memoId);
    const nextMemoIds = draft.selectedMemoIds.filter(
      (id) => normalizeMemoId(id) !== normalizedId,
    );
    const removesAllMemos = countResolvedMemos(nextMemoIds, createdMemos) === 0;

    if (removesAllMemos) {
      preDeleteDraftRef.current = {
        description: draft.description,
        selectedMemoIds: [...draft.selectedMemoIds],
        descriptionOpen,
      };
    }

    setDraft((prev) => ({
      ...prev,
      selectedMemoIds: prev.selectedMemoIds.filter(
        (id) => normalizeMemoId(id) !== normalizedId,
      ),
    }));
    setSelectedMemoRows((prev) => {
      const next = new Set(prev);
      next.delete(normalizedId);
      return next;
    });

    if (removesAllMemos) {
      setDeleteWarningOpen(true);
    }
  }

  function handleRemoveDescription() {
    setDraft((prev) => ({ ...prev, description: '' }));
    setDescriptionOpen(false);
    setSelectedMemoRows((prev) => {
      const next = new Set(prev);
      next.delete(DESCRIPTION_ROW_ID);
      return next;
    });
  }

  function handleKeepJournal() {
    const snapshot = preDeleteDraftRef.current;
    if (snapshot) {
      setDraft((prev) => ({
        ...prev,
        description: snapshot.description,
        selectedMemoIds: [...snapshot.selectedMemoIds],
      }));
      setDescriptionOpen(snapshot.descriptionOpen);
      preDeleteDraftRef.current = null;
    }
    setDeleteWarningOpen(false);
  }

  function openDeleteJournalWarning() {
    preDeleteDraftRef.current = null;
    setDeleteWarningOpen(true);
  }

  function handleSave() {
    setShowErrors(true);
    if (!isEditJournalDraftComplete(draft)) return;

    const record = buildPersistedJournalRecord(journal, draft);
    const updated = journal.isCustom
      ? patchCustomJournal(record.id, record)
      : saveCustomJournal(record);
    if (!updated) return;

    isSubmittingRef.current = true;
    clearEditJournalDraft();
    resetDraft();
    loadedJournalIdRef.current = '';
    navigate(diaryPath(journal.id));
  }

  function confirmDeleteJournal() {
    const journalId = draft.journalId || journal.id;
    preDeleteDraftRef.current = null;

    const memoIds = draft.selectedMemoIds.length > 0
      ? draft.selectedMemoIds
      : (journal.memoryIds ?? []);

    removeCustomJournal(journalId, memoIds);
    isSubmittingRef.current = true;
    isDiscardingRef.current = true;
    clearEditJournalDraft();
    resetDraft();
    loadedJournalIdRef.current = '';
    setDeleteWarningOpen(false);
    navigate(paths.journals);
  }

  return (
    <div className="edit-journal-page">
      <header className="edit-journal-header">
        <div className="edit-journal-hero" aria-hidden="true">
        <img
          className="create-journal-hero-grid"
          src={journalAssets.pixelDeco}
          alt="Decorative pixel grid background"
          aria-hidden="true"
        />
        <img
          className="create-journal-hero-wave"
          src={journalAssets.headerWave}
          alt="Decorative wave illustration"
          aria-hidden="true"
        />
        <img
          className="create-journal-hero-pin"
          src={journalAssets.logoMark}
          alt="MemoMe journals logo mark"
          aria-hidden="true"
        />
          <div className="grid-pattern" />
</div>
          <div className="edit-journal-title-bar">
            <div className="edit-journal-titles">
            <JournalBackButton
              className="create-journal-back"
              onClick={handleBack}
              label="Back to journal"
            />
            {editingTitle ? (
              <input
                ref={titleInputRef}
                className={`edit-journal-title-input${errors.title ? ' edit-journal-title-input--error' : ''}`}
                value={draft.title}
                maxLength={TITLE_MAX}
                onChange={(event) => updateField('title', event.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setEditingTitle(false);
                }}
              />
            ) : (
              <h1 className="edit-journal-title">{draft.title || journal.title}</h1>
            )}
            <button
              type="button"
              className="edit-journal-title-edit"
              aria-label="Edit journal title"
              onClick={() => setEditingTitle(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M15.2307 8.45822L13.5386 6.76579L2.39326 17.9138V19.6062H4.08529L15.2307 8.45822ZM16.9227 6.76579L18.6147 5.07337L16.9227 3.38094L15.2307 5.07337L16.9227 6.76579ZM5.07609 22H0V16.9215L16.0767 0.841109C16.3011 0.616724 16.7778 0.139124 16.9169 0C17.1951 0.278249 17.5443 0.616724 17.7687 0.841109L21.154 4.22715C21.3783 4.45161 21.7218 4.79512 22 5.07337C21.7218 5.35161 21.3783 5.69513 21.154 5.91958L5.07609 22Z" fill="black" />
              </svg>
            </button>
            </div>
          </div>
      </header>

      {dateRange && (
        <p className="edit-journal-dates">{dateRange}</p>
      )}

      <div className="edit-journal-scroll">
        <div className="edit-journal-canvas">
          <div className="edit-journal-content">
            {showDescription ? (
              <div
                className={`edit-journal-description-box${isDescriptionSelected ? ' edit-journal-description-box--active' : ''}`}
                onClick={() => toggleSelectedRow(DESCRIPTION_ROW_ID)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleSelectedRow(DESCRIPTION_ROW_ID);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isDescriptionSelected}
              >
                {isDescriptionSelected && (
                  <button
                    type="button"
                    className="edit-journal-memo-remove"
                    aria-label="Remove description from journal"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveDescription();
                    }}
                  >
                    <span aria-hidden="true">-</span>
                  </button>
                )}
                <textarea
                  className="edit-journal-description-input"
                  value={draft.description}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Trip with friends to Antwerp. Lots of laughs, fun had, clubbing and treats had."
                  readOnly={isDescriptionSelected}
                  onClick={(event) => {
                    if (!isDescriptionSelected) event.stopPropagation();
                  }}
                  onChange={(event) => updateField('description', event.target.value)}
                />
                {errors.description && <p className="create-journal-error">{errors.description}</p>}
              </div>
            ) : (
              selectedMemoRows.size === 0 && (
                <button
                  type="button"
                  className="edit-journal-add-description"
                  onClick={() => setDescriptionOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M0 8.99361H18" stroke="#1952FF" strokeWidth="3.77035" strokeLinejoin="round" />
                    <path d="M8.99361 0V18" stroke="#1952FF" strokeWidth="3.77035" strokeLinejoin="round" />
                  </svg>
                  Add description
                </button>
              )
            )}

            {selectedMemos.map((memo, index) => (
              <EditJournalMemoRow
                key={memo.id}
                rowRef={setRowRef(index)}
                memo={memo}
                layout={memoLayout(index, memo)}
                active={selectedMemoRows.has(normalizeMemoId(memo.id))}
                dragging={draggingIndex === index}
                dragOver={draggingIndex !== null && overIndex === index && draggingIndex !== index}
                onRowClick={() => toggleSelectedRow(normalizeMemoId(memo.id))}
                onRemove={() => handleRemoveMemo(memo.id)}
                menuPointerHandlers={getMenuPointerHandlers(
                  index,
                  () => toggleSelectedRow(normalizeMemoId(memo.id)),
                )}
              />
            ))}

            {selectedMemoRows.size === 0 && (
              <Link to={paths.journalsEditMemos(journal.id)} className="edit-journal-add-memos">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M0.000610352 10.9922H22.0006" stroke="#1952FF" stroke-width="3.77035" stroke-linejoin="round" />
                  <path d="M10.9938 0V22" stroke="#1952FF" stroke-width="3.77035" stroke-linejoin="round" />
                </svg>
                Add memos
              </Link>
            )}

            <div className="journal-detail-wave" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none">
                <path d="M529.311 9.57344C400.118 -24.5679 299.879 59.2893 105.171 26.8324C33.7887 14.9333 -80.1233 14.4542 -126.701 43.6372C-160.38 64.7391 -106.297 69.1191 -67.1521 84.6642" stroke="#A3BAFF" stroke-width="2.47" stroke-dasharray="8 8" />
              </svg>
            </div>

            <button
              type="button"
              className="edit-journal-delete-btn"
              onClick={openDeleteJournalWarning}
            >
              <TrashIcon />
              Delete journal
            </button>
          </div>
        </div>
      </div>

      <div className="edit-journal-footer-bar">
        <button
          type="button"
          className={`edit-journal-save-btn${canSave ? ' edit-journal-save-btn--active' : ''}`}
          disabled={!canSave}
          onClick={handleSave}
        >
          Save changes
        </button>
      </div>

      <CreateJournalWarningModal
        open={leaveWarningOpen}
        onContinue={handleContinueEditing}
        onDiscard={handleDiscard}
      />

      <DeleteJournalWarningModal
        open={deleteWarningOpen}
        onKeep={handleKeepJournal}
        onDelete={confirmDeleteJournal}
      />
    </div>
  );
}
