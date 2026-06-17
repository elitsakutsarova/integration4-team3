import { useEffect, useMemo, useRef, useState } from 'react';
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
import CreateJournalWarningModal from './CreateJournalWarningModal';
import DeleteJournalWarningModal from './DeleteJournalWarningModal';
import EditJournalMemoRow from './EditJournalMemoRow';

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(() => new Set());
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
  const selectedCount = selectedItems.size;
  const canSave = isEditJournalDraftComplete(draft);

  const blocker = useBlocker(
    ({ nextLocation }) =>
      !isSubmittingRef.current
      && !isDiscardingRef.current
      && isDirty
      && !editFlowPaths.has(nextLocation.pathname),
  );

  useEffect(() => {
    isSubmittingRef.current = false;
  }, []);

  useEffect(() => {
    if (loadedJournalIdRef.current === journal.id) return;
    loadedJournalIdRef.current = journal.id;

    const journalSnapshot = buildEditDraftFromJournal(journal);
    const saved = loadEditJournalDraft();
    const workingDraft = saved.journalId === journal.id ? saved : journalSnapshot;
    initDraft(workingDraft, journalSnapshot);
    setDescriptionOpen(Boolean(workingDraft.description.trim()));
  }, [initDraft, journal]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      leaveTargetRef.current = blocker.location?.pathname ?? paths.journals;
      setLeaveWarningOpen(true);
    }
  }, [blocker.state, blocker.location?.pathname]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  function updateField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleBack() {
    if (selectMode) {
      setSelectMode(false);
      setSelectedItems(new Set());
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

  function enterSelectMode(itemId) {
    setSelectMode(true);
    setSelectedItems(new Set([itemId]));
  }

  function toggleSelection(itemId) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleDeleteItems() {
    if (!selectedCount) return;

    const removeDescription = selectedItems.has('description');
    const memoIdsToRemove = new Set(
      [...selectedItems]
        .filter((id) => id !== 'description')
        .map(normalizeMemoId),
    );

    const nextMemoIds = draft.selectedMemoIds.filter(
      (id) => !memoIdsToRemove.has(normalizeMemoId(id)),
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
      description: removeDescription ? '' : prev.description,
      selectedMemoIds: prev.selectedMemoIds.filter(
        (id) => !memoIdsToRemove.has(normalizeMemoId(id)),
      ),
    }));

    if (removeDescription) setDescriptionOpen(false);
    setSelectMode(false);
    setSelectedItems(new Set());

    if (removesAllMemos) {
      setDeleteWarningOpen(true);
    }
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
      <header className="edit-journal-hero">
        <img
          className="create-journal-hero-pixel"
          src={journalAssets.pixelDeco}
          alt=""
          aria-hidden="true"
        />
        <img
          className="create-journal-hero-wave"
          src={journalAssets.createHeaderWave}
          alt=""
          aria-hidden="true"
        />
        <img
          className="create-journal-hero-pin"
          src={journalAssets.createPixelDeco}
          alt=""
          aria-hidden="true"
        />

        {selectMode ? (
          <div className="edit-journal-select-header">
            <button
              type="button"
              className="edit-journal-select-trash"
              aria-label="Delete selected items"
              onClick={handleDeleteItems}
              disabled={!selectedCount}
            >
              <TrashIcon />
            </button>
            <h2 className="edit-journal-select-title">Select item</h2>
            <button
              type="button"
              className="edit-journal-select-close"
              aria-label="Cancel selection"
              onClick={() => {
                setSelectMode(false);
                setSelectedItems(new Set());
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : (
          <button type="button" className="create-journal-back" onClick={handleBack} aria-label="Back to journal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {!selectMode && (
          <div className="edit-journal-title-bar">
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {selectMode && (
        <p className="edit-journal-select-banner" role="status">
          Please select an item to delete it permanently
        </p>
      )}

      {dateRange && (
        <p className="edit-journal-dates">{dateRange}</p>
      )}

      <div className="edit-journal-scroll">
        <div className="edit-journal-canvas">
          <div className="edit-journal-content">
            {showDescription ? (
              <div
                className={`edit-journal-description-box${selectMode && hasDescription ? ' edit-journal-description-box--selectable' : ''}${selectedItems.has('description') ? ' edit-journal-description-box--selected' : ''}`}
                onClick={selectMode && hasDescription ? () => toggleSelection('description') : undefined}
                onKeyDown={selectMode && hasDescription ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleSelection('description');
                  }
                } : undefined}
                role={selectMode && hasDescription ? 'button' : undefined}
                tabIndex={selectMode && hasDescription ? 0 : undefined}
              >
                {!selectMode && hasDescription && (
                  <button
                    type="button"
                    className="edit-journal-description-menu"
                    aria-label="Description options"
                    onClick={() => enterSelectMode('description')}
                  >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </button>
                )}
                <textarea
                  className="edit-journal-description-input"
                  value={draft.description}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Trip with friends to Antwerp. Lots of laughs, fun had, clubbing and treats had."
                  readOnly={selectMode}
                  onChange={(event) => updateField('description', event.target.value)}
                />
                {errors.description && <p className="create-journal-error">{errors.description}</p>}
              </div>
            ) : (
              !selectMode && (
                <button
                  type="button"
                  className="edit-journal-add-description"
                  onClick={() => setDescriptionOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Add description
                </button>
              )
            )}

            {selectedMemos.map((memo, index) => (
              <EditJournalMemoRow
                key={memo.id}
                memo={memo}
                layout={memoLayout(index, memo)}
                selectMode={selectMode}
                selected={selectedItems.has(memo.id)}
                onSelect={() => toggleSelection(memo.id)}
                onMenuClick={() => enterSelectMode(memo.id)}
              />
            ))}

            {!selectMode && (
              <Link to={paths.journalsEditMemos(journal.id)} className="edit-journal-add-memos">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Add memos
              </Link>
            )}

            <div className="edit-journal-wave" aria-hidden="true" />

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
        {selectMode ? (
          <button
            type="button"
            className={`edit-journal-save-btn${selectedCount ? ' edit-journal-save-btn--active' : ''}`}
            disabled={!selectedCount}
            onClick={handleDeleteItems}
          >
            Delete item(s)
          </button>
        ) : (
          <button
            type="button"
            className={`edit-journal-save-btn${canSave ? ' edit-journal-save-btn--active' : ''}`}
            disabled={!canSave}
            onClick={handleSave}
          >
            Save changes
          </button>
        )}
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
