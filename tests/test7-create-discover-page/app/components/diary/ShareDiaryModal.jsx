import { useState } from 'react';
import MemoShareCard, { ShareWholeDiaryCard } from './MemoShareCard';
import ShareSheet from './ShareSheet';
import { buildMemoShareFiles, shareImageFiles, shareToInstagram } from '../../utils/shareImage';
import { useDiaryStickerCatalog } from '../../hooks/useDiaryStickerCatalog';

export default function ShareDiaryModal({
  diary,
  memories,
  diaryId,
  pageOffset,
  pageLayout,
  onClose,
  onCreateRecap,
  onShared,
}) {
  const [selected, setSelected] = useState(new Set());
  const [showSheet, setShowSheet] = useState(false);
  const [sharing, setSharing] = useState(false);
  const stickerCatalog = useDiaryStickerCatalog();

  const memoPages = memories.map((m, i) => ({ memory: m, pageIndex: pageOffset + i }));

  function toggle(pageIndex) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(pageIndex)) next.delete(pageIndex);
      else next.add(pageIndex);
      return next;
    });
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/diary/${diaryId}`;
    navigator.clipboard?.writeText(url);
    onShared?.('Link copied to clipboard');
  }

  async function handleShareApp(appId) {
    if (sharing) return;
    setSharing(true);

    try {
      const indices = [...selected];
      const files = await buildMemoShareFiles(
        diaryId,
        memories,
        indices,
        pageOffset,
        stickerCatalog,
        pageLayout,
      );

      let message;
      if (appId === 'instagram') {
        message = await shareToInstagram(files, {
          title: diary.title,
          text: `My ${diary.title} memories`,
        });
      } else {
        const result = await shareImageFiles(files, {
          title: diary.title,
          text: `Check out my ${diary.title} travel diary!`,
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

  const countLabel = selected.size === 0
    ? 'Select memos to share'
    : `${selected.size} image${selected.size > 1 ? 's' : ''}`;

  return (
    <>
      <div className="share-modal-backdrop" onClick={onClose}>
        <div className="share-modal" onClick={e => e.stopPropagation()}>
          <div className="share-modal-header">
            <div>
              <h2 className="share-modal-title">Share diary</h2>
              <p className="share-modal-count">{countLabel}</p>
            </div>
            <button type="button" className="share-sheet-close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
          </div>

          <div className="share-modal-scroll">
            {memoPages.map(({ memory, pageIndex }) => (
              <MemoShareCard
                key={memory.id}
                memory={memory}
                pageIndex={pageIndex}
                diaryId={diaryId}
                pageLayout={pageLayout}
                selected={selected.has(pageIndex)}
                onToggle={() => toggle(pageIndex)}
              />
            ))}
            <ShareWholeDiaryCard
              onCreateRecap={onCreateRecap}
              onCopyLink={handleCopyLink}
            />
          </div>

          <button
            type="button"
            className={`share-modal-action${selected.size > 0 ? ' share-modal-action--active' : ''}`}
            disabled={selected.size === 0 || sharing}
            onClick={() => setShowSheet(true)}
          >
            {sharing ? 'Preparing…' : 'Share selected'}
          </button>
        </div>
      </div>

      {showSheet && (
        <ShareSheet
          title="Share diary"
          countLabel={countLabel}
          onClose={() => setShowSheet(false)}
          onShareApp={handleShareApp}
          onShareContact={() => handleShareApp('messages')}
          disabled={sharing}
        />
      )}
    </>
  );
}
