import { useMemo, useState } from 'react';
import CreateJournalDecorations from '../journals/CreateJournalDecorations';
import JournalMemoPickCard from '../journals/JournalMemoPickCard';
import RecapTemplateCard from '../journals/RecapTemplateCard';
import ShareSheet from './ShareSheet';
import { MEMO_TAG_OPTIONS } from '../../data/memoTags';
import {
  RECAP_MAX_MEMOS,
  RECAP_STYLES,
} from '../../utils/recapTemplates';
import {
  downloadRecapImageFile,
  renderStyledRecapImage,
  shareImageFiles,
  shareToInstagram,
} from '../../utils/shareImage';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...MEMO_TAG_OPTIONS.map((tag) => ({ id: tag, label: tag })),
  { id: 'Hidden gems', label: 'Hidden gems' },
];

function filterMemos(memos, filterId) {
  if (filterId === 'all') return memos;
  return memos.filter((memo) => (memo.tags ?? []).includes(filterId));
}

function RecapFlowShell({ title, onBack, children, footer, headerExtra = null }) {
  return (
    <div className="recap-flow-page">
      <button type="button" className="create-journal-back" onClick={onBack} aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {headerExtra}
      <CreateJournalDecorations title={title} />
      {children}
      {footer}
    </div>
  );
}

export default function RecapSelectView({
  memories,
  onBack,
  onContinue,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [filterId, setFilterId] = useState('all');

  const filteredMemos = useMemo(
    () => filterMemos(memories, filterId),
    [memories, filterId],
  );
  const selectedCount = selected.size;

  function toggleMemo(memoId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(memoId)) {
        next.delete(memoId);
        return next;
      }
      if (next.size >= RECAP_MAX_MEMOS) return prev;
      next.add(memoId);
      return next;
    });
  }

  const footerLabel = selectedCount === 0
    ? 'Select memos'
    : `Select ${selectedCount} memo${selectedCount === 1 ? '' : 's'}`;

  return (
    <RecapFlowShell
      title="Select memos"
      onBack={onBack}
      headerExtra={(
        <div className="create-journal-pick-count" aria-live="polite">
          <span className="create-journal-pick-count-dot" aria-hidden="true" />
          <span className="create-journal-pick-count-value">
            {selectedCount}
            /
            {RECAP_MAX_MEMOS}
          </span>
        </div>
      )}
      footer={(
        <div className="recap-flow-footer">
          <button
            type="button"
            className={`recap-flow-submit${selectedCount ? ' recap-flow-submit--active' : ''}`}
            disabled={!selectedCount}
            onClick={() => onContinue([...selected])}
          >
            <span>{footerLabel}</span>
            {selectedCount > 0 && <small>out of {RECAP_MAX_MEMOS}</small>}
          </button>
        </div>
      )}
    >
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

      <div className="create-journal-pick-list recap-flow-pick-list">
        {filteredMemos.length === 0 ? (
          <p className="create-journal-pick-empty">No memos match this filter yet.</p>
        ) : (
          filteredMemos.map((memo) => (
            <JournalMemoPickCard
              key={memo.id}
              memo={memo}
              selected={selected.has(memo.id)}
              onToggle={() => toggleMemo(memo.id)}
            />
          ))
        )}
      </div>
    </RecapFlowShell>
  );
}

export function RecapChooseStyleView({
  journal,
  memories,
  selectedIds,
  onBack,
  onShared,
}) {
  const [styleId, setStyleId] = useState(RECAP_STYLES[0].id);
  const [showSheet, setShowSheet] = useState(false);
  const [sharing, setSharing] = useState(false);

  const selectedMemories = useMemo(
    () => {
      const selectedSet = new Set(selectedIds.map(String));
      return memories.filter((memo) => selectedSet.has(String(memo.id)));
    },
    [memories, selectedIds],
  );

  async function buildRecapFile() {
    return renderStyledRecapImage(journal, selectedMemories, styleId);
  }

  async function handleDownload() {
    try {
      const file = await buildRecapFile();
      await downloadRecapImageFile(file);
      onShared?.('Recap downloaded!');
    } catch {
      onShared?.('Download failed — please try again.');
    }
  }

  async function handleShareApp(appId) {
    if (sharing) return;
    setSharing(true);
    try {
      const file = await buildRecapFile();
      let message;
      if (appId === 'instagram') {
        message = await shareToInstagram([file], {
          title: `${journal.title} — Trip Recap`,
          text: `My ${journal.title} recap!`,
        });
      } else {
        const result = await shareImageFiles([file], {
          title: `${journal.title} — Trip Recap`,
          text: `My ${journal.title} recap!`,
        });
        message = result.message ?? 'The trip recap was successfully shared!';
      }
      setShowSheet(false);
      if (message) onShared?.(message);
    } catch (err) {
      console.error(err);
      onShared?.('Could not share — try downloading the image instead.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <RecapFlowShell
      title="Choose recap"
      onBack={onBack}
      headerExtra={(
        <button
          type="button"
          className="recap-flow-download"
          aria-label="Download recap"
          onClick={handleDownload}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      )}
      footer={(
        <div className="recap-flow-footer">
          <button
            type="button"
            className="recap-flow-submit recap-flow-submit--active"
            onClick={() => setShowSheet(true)}
          >
            <span>Share recap</span>
          </button>
        </div>
      )}
    >
      <div className="recap-style-carousel" role="listbox" aria-label="Recap styles">
        {RECAP_STYLES.map((style) => {
          const active = style.id === styleId;
          return (
            <button
              key={style.id}
              type="button"
              role="option"
              aria-selected={active}
              className={`recap-style-option${active ? ' recap-style-option--active' : ''}`}
              onClick={() => setStyleId(style.id)}
            >
              <RecapTemplateCard
                journal={journal}
                memories={selectedMemories}
                styleId={style.id}
                compact
              />
            </button>
          );
        })}
      </div>

      {showSheet && (
        <ShareSheet
          title="Share recap"
          onClose={() => setShowSheet(false)}
          onShareApp={handleShareApp}
          onShareContact={() => handleShareApp('messages')}
          disabled={sharing}
        />
      )}
    </RecapFlowShell>
  );
}

/** @deprecated Use RecapChooseStyleView — kept for TravelDiaryViewer compatibility */
export function RecapPreviewView(props) {
  return (
    <RecapChooseStyleView
      journal={props.diary}
      memories={props.memories}
      selectedIds={props.selectedIds}
      onBack={props.onBack}
      onShared={props.onShared}
    />
  );
}
