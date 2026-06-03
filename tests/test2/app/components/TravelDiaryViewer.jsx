import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { TRAVEL_DIARY, MOCK_MEMORIES, STICKERS } from '../data/mockUser';

function PlacedSticker({ sticker, onRemove }) {
  return (
    <div
      className="diary-placed-sticker"
      style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
      onDoubleClick={() => onRemove(sticker.uid)}
      title="Double-click to remove"
    >
      {sticker.emoji}
    </div>
  );
}

function CoverPage({ diary, pageStickers, onRemoveSticker }) {
  return (
    <div className="diary-page diary-page--cover">
      <div className="diary-page-inner">
        {pageStickers.map(s => (
          <PlacedSticker key={s.uid} sticker={s} onRemove={onRemoveSticker} />
        ))}
        <h2 className="diary-cover-title">{diary.title}</h2>
        <p className="diary-cover-dates">{diary.dateRange}</p>
        <p className="diary-cover-desc">{diary.description}</p>
      </div>
      <div className="diary-page-curl diary-page-curl--right" aria-hidden="true" />
    </div>
  );
}

function MemoPage({ memory, pageStickers, onRemoveSticker }) {
  return (
    <div className="diary-page diary-page--memo">
      <div className="diary-page-spine" aria-hidden="true" />
      <div className="diary-page-inner">
        {pageStickers.map(s => (
          <PlacedSticker key={s.uid} sticker={s} onRemove={onRemoveSticker} />
        ))}
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

function EndPage({ pageStickers, onRemoveSticker }) {
  return (
    <div className="diary-page diary-page--end">
      <div className="diary-page-inner">
        {pageStickers.map(s => (
          <PlacedSticker key={s.uid} sticker={s} onRemove={onRemoveSticker} />
        ))}
        <p className="diary-end-script">The end.</p>
        <p className="diary-end-sub">That was a fun trip!</p>
        <p className="diary-end-hint">
          Want to relive and share your memos with a personalised recap?
        </p>
        <button type="button" className="diary-recap-btn">Create recap of trip</button>
      </div>
      <div className="diary-page-curl diary-page-curl--left" aria-hidden="true" />
    </div>
  );
}

export default function TravelDiaryViewer() {
  const navigate = useNavigate();
  const diary = TRAVEL_DIARY;
  const memories = MOCK_MEMORIES.filter(m => diary.memoryIds.includes(m.id));

  const totalPages = 1 + memories.length + 1; // cover + memos + end
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [pageStickers, setPageStickers] = useState({});
  const [draggingSticker, setDraggingSticker] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const pageRef = useRef(null);
  const dragStartRef = useRef(null);

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

  function getPageStickers(idx) {
    return pageStickers[idx] ?? [];
  }

  function addStickerToPage(pageIdx, sticker, x, y) {
    setPageStickers(prev => ({
      ...prev,
      [pageIdx]: [...(prev[pageIdx] ?? []), { uid: Date.now(), emoji: sticker.emoji, x, y }],
    }));
  }

  function removeSticker(uid) {
    setPageStickers(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].filter(s => s.uid !== uid);
      }
      return next;
    });
  }

  function handlePageClick(e) {
    if (draggingSticker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrev();
    else if (x > rect.width * 0.7) goNext();
  }

  /* Drag-to-flip */
  function handlePointerDown(e) {
    if (draggingSticker) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function handlePointerUp(e) {
    if (!dragStartRef.current || draggingSticker) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dt = Date.now() - dragStartRef.current.t;
    dragStartRef.current = null;
    if (dt < 400 && Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  /* Sticker drag from tray */
  function startStickerDrag(sticker, e) {
    e.preventDefault();
    setDraggingSticker(sticker);
    setDragPos({ x: e.clientX, y: e.clientY });
  }

  function moveStickerDrag(e) {
    if (!draggingSticker) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  }

  function endStickerDrag(e) {
    if (!draggingSticker || !pageRef.current) {
      setDraggingSticker(null);
      setDragPos(null);
      return;
    }
    const rect = pageRef.current.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
      const x = ((cx - rect.left) / rect.width) * 100;
      const y = ((cy - rect.top) / rect.height) * 100;
      addStickerToPage(pageIndex, draggingSticker, Math.max(5, Math.min(90, x)), Math.max(5, Math.min(90, y)));
    }
    setDraggingSticker(null);
    setDragPos(null);
  }

  function renderPage() {
    const stickers = getPageStickers(pageIndex);
    const onRemove = removeSticker;

    if (pageIndex === 0) {
      return <CoverPage diary={diary} pageStickers={stickers} onRemoveSticker={onRemove} />;
    }
    if (pageIndex === totalPages - 1) {
      return <EndPage pageStickers={stickers} onRemoveSticker={onRemove} />;
    }
    const memory = memories[pageIndex - 1];
    return <MemoPage memory={memory} pageStickers={stickers} onRemoveSticker={onRemove} />;
  }

  return (
    <div
      className="diary-viewer"
      onPointerMove={moveStickerDrag}
      onPointerUp={endStickerDrag}
      onPointerLeave={endStickerDrag}
    >
      <header className="diary-header">
        <button type="button" className="diary-back-btn" onClick={() => navigate('/profile')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="diary-header-title">{diary.title}</h1>
        <button type="button" className="diary-share-btn" aria-label="Share">
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
        <div className="diary-flip-hint diary-flip-hint--left" aria-hidden="true" />
        <div className="diary-flip-hint diary-flip-hint--right" aria-hidden="true" />
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

      <div className="diary-sticker-tray">
        <p className="diary-sticker-label">Stickers — drag onto page</p>
        <div className="diary-sticker-row">
          {STICKERS.map(sticker => (
            <button
              key={sticker.id}
              type="button"
              className="diary-sticker-btn"
              onPointerDown={e => startStickerDrag(sticker, e)}
              aria-label={sticker.label}
            >
              {sticker.emoji}
            </button>
          ))}
        </div>
      </div>

      {draggingSticker && dragPos && (
        <div
          className="diary-sticker-ghost"
          style={{ left: dragPos.x, top: dragPos.y }}
          aria-hidden="true"
        >
          {draggingSticker.emoji}
        </div>
      )}
    </div>
  );
}
