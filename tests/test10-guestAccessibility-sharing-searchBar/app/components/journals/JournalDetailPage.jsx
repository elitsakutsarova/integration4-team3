import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import DraggableSticker from '../diary/DraggableSticker';
import RecapSelectView, { RecapChooseStyleView } from '../diary/RecapViews';
import { diaryPath, paths } from '../../utils/appPaths';
import {
  createSticker,
  loadPageStickers,
  savePageStickers,
  syncDiaryLayoutToStorage,
} from '../../utils/stickerTracker';
import JournalMemoEntry from './JournalMemoEntry';
import JournalStickerDock from './JournalStickerDock';

const JOURNAL_CANVAS_PAGE = 0;

function memoLayout(index, memo) {
  if (!memo.mediaPreview?.url) return 'text';
  if (index % 2 === 1) return 'right';
  return 'left';
}

function SuccessToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="share-success-backdrop" onClick={onClose}>
      <div className="share-success-modal" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default function JournalDetailPage({
  journal,
  memories,
  backTo = paths.journals,
}) {
  const navigate = useNavigate();
  const diaryId = journal.id;

  const [pageStickers, setPageStickers] = useState(() => ({
    [JOURNAL_CANVAS_PAGE]: loadPageStickers(diaryId, JOURNAL_CANVAS_PAGE),
  }));
  const [view, setView] = useState('journal');
  const [recapSelectedIds, setRecapSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const dropZoneRef = useRef(null);
  const trayRef = useRef(null);

  const handleDropOnPage = useCallback((stickerDef, x, y, targetPageIndex) => {
    const newSticker = createSticker(stickerDef, x, y);
    setPageStickers((prev) => {
      const next = [...(prev[targetPageIndex] ?? []), newSticker];
      savePageStickers(diaryId, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, [diaryId]);

  const handleMoveSticker = useCallback((targetPageIndex, uid, x, y) => {
    setPageStickers((prev) => {
      const page = prev[targetPageIndex] ?? [];
      const next = page.map((s) => (s.uid === uid ? { ...s, x, y } : s));
      savePageStickers(diaryId, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, [diaryId]);

  const handleReturnToTray = useCallback((targetPageIndex, uid) => {
    setPageStickers((prev) => {
      const next = (prev[targetPageIndex] ?? []).filter((s) => s.uid !== uid);
      savePageStickers(diaryId, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, [diaryId]);

  function handleEditJournal() {
    navigate(paths.journalsEdit(journal.id));
  }

  const placedStickers = (pageStickers[JOURNAL_CANVAS_PAGE] ?? []).map((s) => (
    <DraggableSticker
      key={s.uid}
      sticker={s}
      pageIndex={JOURNAL_CANVAS_PAGE}
      diaryId={diaryId}
      dropZoneRef={dropZoneRef}
      trayRef={trayRef}
      onMove={(uid, x, y) => handleMoveSticker(JOURNAL_CANVAS_PAGE, uid, x, y)}
      onReturnToTray={(uid) => handleReturnToTray(JOURNAL_CANVAS_PAGE, uid)}
    />
  ));

  if (view === 'recap-select') {
    return (
      <>
        <RecapSelectView
          memories={memories}
          onBack={() => setView('journal')}
          onContinue={(ids) => {
            syncDiaryLayoutToStorage(diaryId, pageStickers);
            setRecapSelectedIds(ids);
            setView('recap-choose');
          }}
        />
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      </>
    );
  }

  if (view === 'recap-choose') {
    return (
      <>
        <RecapChooseStyleView
          journal={journal}
          memories={memories}
          selectedIds={recapSelectedIds}
          onBack={() => setView('recap-select')}
          onShared={(msg) => setSuccessMsg(msg)}
        />
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      </>
    );
  }

  return (
    <div className="journal-detail-page">
      <header className="journal-detail-header">
        <Link to={backTo} className="journal-detail-back" aria-label="Back to journals">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>

        <div className="journal-detail-title-bar">
          <h1 className="journal-detail-title">{journal.title}</h1>
        </div>

        <button
          type="button"
          className="journal-detail-share"
          aria-label="Share journal"
          onClick={() => {
            syncDiaryLayoutToStorage(diaryId, pageStickers);
            setView('recap-select');
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </header>

      {journal.dateRange && (
        <p className="journal-detail-dates">{journal.dateRange}</p>
      )}

      <div className="journal-detail-scroll">
        <div
          ref={dropZoneRef}
          className="journal-detail-canvas diary-drop-zone"
        >
          {placedStickers}
          <div className="journal-detail-memos">
            {journal.description?.trim() && (
              <p className="journal-detail-description">{journal.description}</p>
            )}
            {memories.map((memo, index) => (
              <JournalMemoEntry
                key={memo.id}
                memo={memo}
                layout={memoLayout(index, memo)}
              />
            ))}
          </div>

          <div className="journal-detail-wave" aria-hidden="true" />

          <div className="journal-detail-actions">
            <button
              type="button"
              className="journal-detail-action journal-detail-action--edit"
              onClick={handleEditJournal}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span>Edit journal</span>
            </button>
            <button
              type="button"
              className="journal-detail-action journal-detail-action--recap"
              onClick={() => {
                syncDiaryLayoutToStorage(diaryId, pageStickers);
                setView('recap-select');
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <polyline points="3 4 3 10 9 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Create recap</span>
            </button>
          </div>
        </div>
      </div>

      <JournalStickerDock
        dropZoneRef={dropZoneRef}
        trayRef={trayRef}
        pageIndex={JOURNAL_CANVAS_PAGE}
        onDropOnPage={handleDropOnPage}
      />

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
    </div>
  );
}
