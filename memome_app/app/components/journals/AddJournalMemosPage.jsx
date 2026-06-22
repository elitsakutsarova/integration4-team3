import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useCreateJournal } from '../../context/CreateJournalContext';
import { useEditJournal } from '../../context/EditJournalContext';
import { useCreatedMemos } from '../../context/CreatedMemosContext';
import { paths } from '../../utils/appPaths';
import { MEMO_TAG_OPTIONS } from '../../data/memoTags';
import MemoTagIcon from '../MemoTagIcon';
import CreateJournalDecorations from './CreateJournalDecorations';
import JournalMemoPickCard from './JournalMemoPickCard';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...MEMO_TAG_OPTIONS.map((tag) => ({ id: tag, label: tag })),
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
      <CreateJournalDecorations
        title="Add memories"
        backTo={backPath}
        backLabel={isEditFlow ? 'Back to edit journal' : 'Back to create journal'}
      />

      <div className="create-journal-pick-count" aria-live="polite">
        <span className="create-journal-pick-count-dot" aria-hidden="true" />
        <span className="create-journal-pick-count-value">{selectedSet.size}</span>
      </div>

      <div className="create-journal-filter-bar" role="toolbar" aria-label="Filter memos">
        <div className="map-category-row">
          {FILTER_OPTIONS.map((option) => {
            const active = option.id === filterId;
            const showIcon = option.id !== 'all';
            return (
              <button
                key={option.id}
                type="button"
                className={`map-category-chip${active ? ' map-category-chip--active' : ''}`}
                aria-pressed={active}
                onClick={() => setFilterId(option.id)}
              >
                {showIcon && <MemoTagIcon tag={option.label} />}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="create-journal-pick-list collection-memo-list collection-memo-list--created">
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
