import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { TRAVEL_DIARY, MOCK_MEMORIES, STICKERS } from '../data/mockUser';
import {
  loadPageStickers,
  savePageStickers,
  createSticker,
} from '../utils/stickerTracker';
import DraggableSticker from './diary/DraggableSticker';
import DiaryStickerTray from './diary/DiaryStickerTray';
import ShareDiaryModal from './diary/ShareDiaryModal';
import RecapSelectView, { RecapPreviewView } from './diary/RecapViews';

const DIARY_ID = TRAVEL_DIARY.id;
const MEMO_PAGE_OFFSET = 1; // page 0 = cover

function CoverPage({ diary, children, dropZoneRef }) {
  return (
    <div className="diary-page diary-page--cover">
      <div className="diary-page-inner diary-drop-zone" ref={dropZoneRef}>
        {children}
        <h2 className="diary-cover-title">{diary.title}</h2>
        <p className="diary-cover-dates">{diary.dateRange}</p>
        <p className="diary-cover-desc">{diary.description}</p>
      </div>
      <div className="diary-page-curl diary-page-curl--right" aria-hidden="true" />
    </div>
  );
}

function MemoPage({ memory, children, dropZoneRef }) {
  return (
    <div className="diary-page diary-page--memo">
      <div className="diary-page-spine" aria-hidden="true" />
      <div className="diary-page-inner diary-drop-zone" ref={dropZoneRef}>
        {children}
        <p className="diary-memo-date">{memory.date}</p>
        <div className="diary-polaroid">
          <span className="diary-corner diary-corner--tl" aria-hidden="true" />
          <span className="diary-corner diary-corner--br" aria-hidden="true" />
          <div className="diary-polaroid-photo" />
        </div>
        <p className="diary-memo-quote">&ldquo;{memory.quote}&rdquo;</p>
        <p className="diary-memo-location">At: {memory.location}</p>
      </div>
      <div className="diary-page-curl diary-page-curl--right" aria-hidden="true" />
    </div>
  );
}

function EndPage({ children, onCreateRecap, dropZoneRef }) {
  return (
    <div className="diary-page diary-page--end">
      <div className="diary-page-inner diary-drop-zone" ref={dropZoneRef}>
        {children}
        <p className="diary-end-script">The end.</p>
        <p className="diary-end-sub">That was a fun trip!</p>
        <p className="diary-end-hint">
          Want to relive and share your memos with a personalised recap?
        </p>
        <button type="button" className="diary-recap-btn" onClick={onCreateRecap}>
          Create recap of trip
        </button>
      </div>
      <div className="diary-page-curl diary-page-curl--left" aria-hidden="true" />
    </div>
  );
}

function SuccessToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="share-success-backdrop" onClick={onClose}>
      <div className="share-success-modal" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default function TravelDiaryViewer() {
  const navigate = useNavigate();
  const diary = TRAVEL_DIARY;
  const memories = MOCK_MEMORIES.filter(m => diary.memoryIds.includes(m.id));
  const totalPages = 1 + memories.length + 1;

  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [pageStickers, setPageStickers] = useState({});
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);

  const [view, setView] = useState('diary'); // diary | share | recap-select | recap-preview
  const [recapSelectedIds, setRecapSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const pageRef = useRef(null);
  const dropZoneRef = useRef(null);
  const trayRef = useRef(null);
  const dragStartRef = useRef(null);

  useEffect(() => {
    const loaded = {};
    for (let i = 0; i < totalPages; i++) {
      loaded[i] = loadPageStickers(DIARY_ID, i);
    }
    setPageStickers(loaded);
  }, [totalPages]);

  const persistPage = useCallback((idx, stickers) => {
    setPageStickers(prev => ({ ...prev, [idx]: stickers }));
    savePageStickers(DIARY_ID, idx, stickers);
  }, []);

  const goNext = useCallback(() => {
    if (pageIndex < totalPages - 1) {
      setDirection('next');
      setPageIndex(i => i + 1);
    }
  }, [pageIndex, totalPages]);

  const goPrev = useCallback(() => {
    if (pageIndex > 0) {
      setDirection('prev');
      setPageIndex(i => i - 1);
    }
  }, [pageIndex]);

  function handleDropOnPage(stickerDef, x, y) {
    const next = [...(pageStickers[pageIndex] ?? []), createSticker(stickerDef, x, y)];
    persistPage(pageIndex, next);
  }

  function handleMoveSticker(uid, x, y) {
    const next = (pageStickers[pageIndex] ?? []).map(s =>
      s.uid === uid ? { ...s, x, y } : s,
    );
    persistPage(pageIndex, next);
  }

  function handleReturnToTray(uid) {
    const next = (pageStickers[pageIndex] ?? []).filter(s => s.uid !== uid);
    persistPage(pageIndex, next);
  }

  function handlePageClick(e) {
    if (isDraggingSticker) return;
    if (e.target.closest('.diary-placed-sticker')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrev();
    else if (x > rect.width * 0.7) goNext();
  }

  function handlePointerDown(e) {
    if (isDraggingSticker) return;
    if (e.target.closest('.diary-placed-sticker')) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function handlePointerUp(e) {
    if (!dragStartRef.current || isDraggingSticker) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dt = Date.now() - dragStartRef.current.t;
    dragStartRef.current = null;
    if (dt < 400 && Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  function renderStickers() {
    return (pageStickers[pageIndex] ?? []).map(s => (
      <DraggableSticker
        key={s.uid}
        sticker={s}
        pageIndex={pageIndex}
        dropZoneRef={dropZoneRef}
        trayRef={trayRef}
        onMove={handleMoveSticker}
        onReturnToTray={handleReturnToTray}
        onDragStart={() => setIsDraggingSticker(true)}
        onDragEnd={() => setIsDraggingSticker(false)}
      />
    ));
  }

  function renderPage() {
    const stickers = renderStickers();
    if (pageIndex === 0) {
      return <CoverPage diary={diary} dropZoneRef={dropZoneRef}>{stickers}</CoverPage>;
    }
    if (pageIndex === totalPages - 1) {
      return (
        <EndPage onCreateRecap={() => setView('recap-select')} dropZoneRef={dropZoneRef}>
          {stickers}
        </EndPage>
      );
    }
    return (
      <MemoPage memory={memories[pageIndex - 1]} dropZoneRef={dropZoneRef}>
        {stickers}
      </MemoPage>
    );
  }

  if (view === 'recap-select') {
    return (
      <>
        <RecapSelectView
          diary={diary}
          memories={memories}
          diaryId={DIARY_ID}
          pageOffset={MEMO_PAGE_OFFSET}
          onBack={() => setView('diary')}
          onPreview={ids => {
            setRecapSelectedIds(ids);
            setView('recap-preview');
          }}
          onShared={msg => setSuccessMsg(msg)}
        />
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      </>
    );
  }

  if (view === 'recap-preview') {
    return (
      <>
        <RecapPreviewView
          diary={diary}
          memories={memories}
          selectedIds={recapSelectedIds}
          diaryId={DIARY_ID}
          pageOffset={MEMO_PAGE_OFFSET}
          onBack={() => setView('recap-select')}
          onGoDiary={() => setView('diary')}
          onShared={msg => setSuccessMsg(msg)}
        />
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      </>
    );
  }

  return (
    <div className="diary-viewer">
      <header className="diary-header">
        <button type="button" className="diary-back-btn" onClick={() => navigate('/profile')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="diary-header-title">{diary.title}</h1>
        <button
          type="button"
          className="diary-share-btn"
          aria-label="Share"
          onClick={() => setView('share')}
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

      <div
        ref={pageRef}
        className={`diary-stage diary-stage--${direction}`}
        onClick={handlePageClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        role="region"
        aria-label={`Diary page ${pageIndex + 1} of ${totalPages}`}
      >
        {renderPage()}
      </div>

      <div className="diary-pagination" role="tablist" aria-label="Page navigation">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === pageIndex}
            className={`diary-dot${i === pageIndex ? ' diary-dot--active' : ''}`}
            onClick={() => {
              setDirection(i > pageIndex ? 'next' : 'prev');
              setPageIndex(i);
            }}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>

      <DiaryStickerTray
        key={pageIndex}
        stickers={STICKERS}
        dropZoneRef={dropZoneRef}
        trayRef={trayRef}
        pageIndex={pageIndex}
        onDropOnPage={handleDropOnPage}
      />

      {view === 'share' && (
        <ShareDiaryModal
          diary={diary}
          memories={memories}
          diaryId={DIARY_ID}
          pageOffset={MEMO_PAGE_OFFSET}
          onClose={() => setView('diary')}
          onCreateRecap={() => setView('recap-select')}
          onShared={msg => {
            setView('diary');
            setSuccessMsg(msg);
          }}
        />
      )}

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
    </div>
  );
}
