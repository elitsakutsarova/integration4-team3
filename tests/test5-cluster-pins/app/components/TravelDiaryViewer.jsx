import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { TRAVEL_DIARY, MOCK_MEMORIES } from '../data/mockUser';
import {
  loadPageStickers,
  savePageStickers,
  syncDiaryLayoutToStorage,
  createSticker,
} from '../utils/stickerTracker';
import DraggableSticker from './diary/DraggableSticker';
import DiaryStickerTray from './diary/DiaryStickerTray';
import ShareDiaryModal from './diary/ShareDiaryModal';
import RecapSelectView, { RecapPreviewView } from './diary/RecapViews';

const DIARY_ID = TRAVEL_DIARY.id;
const MEMO_PAGE_OFFSET = 1; // page 0 = cover

function loadAllPageStickers(diaryId, totalPages) {
  const loaded = {};
  for (let i = 0; i < totalPages; i += 1) {
    loaded[i] = loadPageStickers(diaryId, i);
  }
  return loaded;
}

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
  const diary = TRAVEL_DIARY;
  const memories = MOCK_MEMORIES.filter(m => diary.memoryIds.includes(m.id));
  const totalPages = 1 + memories.length + 1;

  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [pageStickers, setPageStickers] = useState(() => loadAllPageStickers(DIARY_ID, totalPages));

  const [view, setView] = useState('diary'); // diary | share | recap-select | recap-preview
  const [recapSelectedIds, setRecapSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const pageRef = useRef(null);
  const dropZoneRef = useRef(null);
  const trayRef = useRef(null);
  const dragStartRef = useRef(null);
  const isDraggingStickerRef = useRef(false);
  const lastFlipRef = useRef(0);
  const touchHandledRef = useRef(false);

  function resetDragState() {
    isDraggingStickerRef.current = false;
    dragStartRef.current = null;
  }

  const goNext = useCallback(() => {
    if (pageIndex < totalPages - 1) {
      resetDragState();
      setDirection('next');
      setPageIndex(i => i + 1);
    }
  }, [pageIndex, totalPages]);

  const goPrev = useCallback(() => {
    if (pageIndex > 0) {
      resetDragState();
      setDirection('prev');
      setPageIndex(i => i - 1);
    }
  }, [pageIndex]);

  const lastDropAtRef = useRef(0);

  const handleDropOnPage = useCallback((stickerDef, x, y, targetPageIndex) => {
    const now = Date.now();
    if (now - lastDropAtRef.current < 300) return;
    lastDropAtRef.current = now;

    const newSticker = createSticker(stickerDef, x, y);
    setPageStickers(prev => {
      const next = [...(prev[targetPageIndex] ?? []), newSticker];
      savePageStickers(DIARY_ID, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, []);

  const handleMoveSticker = useCallback((targetPageIndex, uid, x, y) => {
    setPageStickers(prev => {
      const next = (prev[targetPageIndex] ?? []).map(s =>
        s.uid === uid ? { ...s, x, y } : s,
      );
      savePageStickers(DIARY_ID, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, []);

  const handleReturnToTray = useCallback((targetPageIndex, uid) => {
    setPageStickers(prev => {
      const next = (prev[targetPageIndex] ?? []).filter(s => s.uid !== uid);
      savePageStickers(DIARY_ID, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, []);

  const goNextRef = useRef(goNext);
  const goPrevRef = useRef(goPrev);
  goNextRef.current = goNext;
  goPrevRef.current = goPrev;

  function processStageGesture(startX, startY, endX, endY, startTime, target) {
    if (isDraggingStickerRef.current) return;
    if (target?.closest?.('.diary-placed-sticker')) return;
    if (target?.closest?.('.diary-sticker-tray')) return;
    if (target?.closest?.('.diary-recap-btn')) return;

    const dx = endX - startX;
    const dy = endY - startY;
    const dt = Date.now() - startTime;
    const tap = Math.abs(dx) < 18 && Math.abs(dy) < 18;

    if (!tap && dt < 500 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      const now = Date.now();
      if (now - lastFlipRef.current >= 400) {
        lastFlipRef.current = now;
        if (dx < 0) goNextRef.current();
        else goPrevRef.current();
      }
      return;
    }

    if (tap) handlePageTap(endX, endY, target);
  }

  function handlePageTap(clientX, clientY, target) {
    if (isDraggingStickerRef.current) return;
    if (target?.closest?.('.diary-placed-sticker')) return;
    if (target?.closest?.('.diary-sticker-tray')) return;
    if (target?.closest?.('.diary-recap-btn')) return;

    const now = Date.now();
    if (now - lastFlipRef.current < 400) return;
    lastFlipRef.current = now;

    const stage = pageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = clientX - rect.left;
    if (x < rect.width * 0.3) goPrevRef.current();
    else if (x > rect.width * 0.7) goNextRef.current();
  }

  function handleStagePointerDown(e) {
    if (e.pointerType === 'touch') return;
    if (touchHandledRef.current) return;
    if (isDraggingStickerRef.current) return;
    if (e.target.closest('.diary-placed-sticker')) return;
    if (e.target.closest('.diary-recap-btn')) return;

    try {
      pageRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now(),
      pointerId: e.pointerId,
    };
  }

  function handleStagePointerUp(e) {
    if (e.pointerType === 'touch') return;
    if (touchHandledRef.current) return;
    if (isDraggingStickerRef.current) return;

    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    dragStartRef.current = null;

    try {
      pageRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (e.target.closest('.diary-placed-sticker')) return;
    processStageGesture(start.x, start.y, e.clientX, e.clientY, start.t, e.target);
  }

  function handleStageTouchStart(e) {
    if (e.touches.length !== 1) return;
    if (isDraggingStickerRef.current) return;
    const target = e.target;
    if (target.closest('.diary-placed-sticker')) return;
    if (target.closest('.diary-recap-btn')) return;

    touchHandledRef.current = false;
    const t = e.touches[0];
    dragStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      t: Date.now(),
      isTouch: true,
    };
  }

  function handleStageTouchEnd(e) {
    if (isDraggingStickerRef.current) return;

    const start = dragStartRef.current;
    if (!start?.isTouch) return;
    dragStartRef.current = null;

    const t = e.changedTouches[0];
    if (!t) return;

    touchHandledRef.current = true;
    processStageGesture(start.x, start.y, t.clientX, t.clientY, start.t, e.target);
    window.setTimeout(() => {
      touchHandledRef.current = false;
    }, 400);
  }

  function handleStageClick(e) {
    if (touchHandledRef.current) return;
    handlePageTap(e.clientX, e.clientY, e.target);
  }

  function renderStickers(forPageIndex) {
    return (pageStickers[forPageIndex] ?? []).map(s => (
      <DraggableSticker
        key={`${forPageIndex}-${s.uid}`}
        sticker={s}
        pageIndex={forPageIndex}
        diaryId={DIARY_ID}
        dropZoneRef={dropZoneRef}
        trayRef={trayRef}
        onMove={(uid, x, y) => handleMoveSticker(forPageIndex, uid, x, y)}
        onReturnToTray={uid => handleReturnToTray(forPageIndex, uid)}
        onDragStart={() => {
          isDraggingStickerRef.current = true;
        }}
        onDragEnd={() => {
          isDraggingStickerRef.current = false;
        }}
      />
    ));
  }

  function renderPage() {
    const stickers = renderStickers(pageIndex);
    if (pageIndex === 0) {
      return <CoverPage key="page-0" diary={diary} dropZoneRef={dropZoneRef}>{stickers}</CoverPage>;
    }
    if (pageIndex === totalPages - 1) {
      return (
        <EndPage key={`page-${pageIndex}`} onCreateRecap={() => setView('recap-select')} dropZoneRef={dropZoneRef}>
          {stickers}
        </EndPage>
      );
    }
    return (
      <MemoPage key={`page-${pageIndex}`} memory={memories[pageIndex - 1]} dropZoneRef={dropZoneRef}>
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
            syncDiaryLayoutToStorage(DIARY_ID, pageStickers);
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
          pageLayout={pageStickers}
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
        <Link to="/profile" className="diary-back-btn" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="diary-header-title">{diary.title}</h1>
        <button
          type="button"
          className="diary-share-btn"
          aria-label="Share"
          onClick={() => {
            syncDiaryLayoutToStorage(DIARY_ID, pageStickers);
            setView('share');
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

      <div
        ref={pageRef}
        className={`diary-stage diary-stage--${direction}`}
        onClick={handleStageClick}
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={() => { dragStartRef.current = null; }}
        onTouchStart={handleStageTouchStart}
        onTouchEnd={handleStageTouchEnd}
        role="region"
        aria-label={`Diary page ${pageIndex + 1} of ${totalPages}`}
      >
        <div key={`page-shell-${pageIndex}`} className="diary-page-shell">
          {renderPage()}
        </div>
      </div>

      <div className="diary-bottom-dock">
        <div className="diary-pagination" role="tablist" aria-label="Page navigation">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === pageIndex}
              className={`diary-dot${i === pageIndex ? ' diary-dot--active' : ''}`}
              onClick={() => {
                resetDragState();
                setDirection(i > pageIndex ? 'next' : 'prev');
                setPageIndex(i);
              }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        <DiaryStickerTray
          key={pageIndex}
          dropZoneRef={dropZoneRef}
          trayRef={trayRef}
          pageIndex={pageIndex}
          onDropOnPage={handleDropOnPage}
        />
      </div>

      {view === 'share' && (
        <ShareDiaryModal
          diary={diary}
          memories={memories}
          diaryId={DIARY_ID}
          pageOffset={MEMO_PAGE_OFFSET}
          pageLayout={pageStickers}
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
