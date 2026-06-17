import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCreateJournal } from '../../context/CreateJournalContext';
import { useEditJournal } from '../../context/EditJournalContext';
import { useCreatedMemos } from '../../context/CreatedMemosContext';
import { paths } from '../../utils/appPaths';
import { MEMO_TAG_OPTIONS } from '../../data/memoTags';
import JournalMemoPickCard from './JournalMemoPickCard';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...MEMO_TAG_OPTIONS.map((tag) => ({ id: tag, label: tag })),
  { id: 'Hidden gems', label: 'Hidden gems' },
];

function filterMemos(memos, filterId) {
  if (filterId === 'all') return memos;
  return memos.filter((memo) => (memo.tags ?? []).includes(filterId));
}

export default function AddJournalMemosPage({ flow = 'create', journalId = null }) {
  const navigate = useNavigate();
  const createJournal = useCreateJournal();
  const editJournal = useEditJournal();
  const isEditFlow = flow === 'edit';
  const { draft, setDraft } = isEditFlow ? editJournal : createJournal;
  const { createdMemos, ready } = useCreatedMemos();
  const [filterId, setFilterId] = useState('all');

  const backPath = isEditFlow && journalId
    ? paths.journalsEdit(journalId)
    : paths.journalsCreate;

  const selectedSet = useMemo(() => new Set(draft.selectedMemoIds), [draft.selectedMemoIds]);
  const filteredMemos = useMemo(
    () => filterMemos(createdMemos, filterId),
    [createdMemos, filterId],
  );

  function toggleMemo(memoId) {
    setDraft((prev) => {
      const exists = prev.selectedMemoIds.includes(memoId);
      return {
        ...prev,
        selectedMemoIds: exists
          ? prev.selectedMemoIds.filter((id) => id !== memoId)
          : [...prev.selectedMemoIds, memoId],
      };
    });
  }

  function handleConfirm() {
    if (!selectedSet.size) return;
    navigate(backPath);
  }

  return (
    <>
      <Link
        to={backPath}
        className="create-journal-back"
        aria-label={isEditFlow ? 'Back to edit journal' : 'Back to create journal'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="create-journal-pick-count" aria-live="polite">
        <span className="create-journal-pick-count-dot" aria-hidden="true" />
        <span className="create-journal-pick-count-value">{selectedSet.size}</span>
      </div>

      <div className="create-journal-filter-bar" role="toolbar" aria-label="Filter memos">
        <div className="create-journal-filter-track">
          {FILTER_OPTIONS.map((option) => {
            const active = option.id === filterId;
            return (
              <button
                key={option.id}
                type="button"
                className={`create-journal-filter-chip${active ? ' create-journal-filter-chip--active' : ''}`}
                aria-pressed={active}
                onClick={() => setFilterId(option.id)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="create-journal-pick-list">
        {!ready ? (
          <p className="create-journal-pick-loading">Loading your memos…</p>
        ) : filteredMemos.length === 0 ? (
          <p className="create-journal-pick-empty">No memos match this filter yet.</p>
        ) : (
          filteredMemos.map((memo) => (
            <JournalMemoPickCard
              key={memo.id}
              memo={memo}
              selected={selectedSet.has(memo.id)}
              onToggle={() => toggleMemo(memo.id)}
            />
          ))
        )}
      </div>

      <div className="create-journal-pick-footer">
        <button
          type="button"
          className={`create-journal-pick-submit${selectedSet.size ? ' create-journal-pick-submit--active' : ''}`}
          disabled={!selectedSet.size}
          onClick={handleConfirm}
        >
          Select memos
        </button>
      </div>
    </>
  );
}
