import { useState } from 'react';
import ShareSheet from './ShareSheet';
import {
  buildMemoShareFiles,
  renderRecapImage,
  shareImageFiles,
  shareToInstagram,
} from '../../utils/shareImage';

export default function RecapSelectView({ diary, memories, diaryId, pageOffset, onBack, onPreview, onShared }) {
  const [selected, setSelected] = useState(new Set(memories.map(m => m.id)));

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="recap-select-page">
      <header className="recap-header">
        <button type="button" className="diary-back-btn" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="recap-header-title">Added memos</h1>
        <span className="recap-count-badge">
          <span className="recap-count-dot" />
          {selected.size}
        </span>
      </header>

      <p className="recap-select-hint">Select memos you want to be included in your trip recap</p>

      <div className="recap-memo-list">
        {memories.map(memory => {
          const isSelected = selected.has(memory.id);
          return (
            <div
              key={memory.id}
              className={`recap-memo-card${isSelected ? ' recap-memo-card--selected' : ''}`}
            >
              <div className="recap-memo-img">
                <span className="profile-avatar-label">IMG</span>
              </div>
              <p className="recap-memo-quote">&ldquo;{memory.quote}&rdquo;</p>
              <p className="recap-memo-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {memory.location}
              </p>
              <button
                type="button"
                className="recap-toggle-btn"
                onClick={() => toggle(memory.id)}
              >
                {isSelected ? 'Unselect' : 'Select'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="recap-footer">
        <button
          type="button"
          className={`form-publish-btn form-publish-btn--active${selected.size === 0 ? '' : ''}`}
          disabled={selected.size === 0}
          onClick={() => onPreview([...selected])}
        >
          Create recap
        </button>
      </div>
    </div>
  );
}

export function RecapPreviewView({ diary, memories, selectedIds, diaryId, pageOffset, onBack, onGoDiary, onShared }) {
  const [showSheet, setShowSheet] = useState(false);
  const [sharing, setSharing] = useState(false);
  const selectedMemories = memories.filter(m => selectedIds.includes(m.id));

  async function handleShareApp(appId) {
    if (sharing) return;
    setSharing(true);

    try {
      const pageIndices = selectedMemories.map(m => pageOffset + memories.indexOf(m));
      let files;

      if (appId === 'instagram' && selectedMemories.length <= 10) {
        // Instagram: share individual memo cards with stickers baked in
        files = await buildMemoShareFiles(diaryId, memories, pageIndices, pageOffset);
      } else {
        // Recap collage for other apps or many memos
        files = [await renderRecapImage(diary, selectedMemories, diaryId, pageOffset)];
      }

      let message;
      if (appId === 'instagram') {
        message = await shareToInstagram(files, {
          title: `${diary.title} — Trip Recap`,
          text: `My ${diary.title} recap!`,
        });
      } else {
        const result = await shareImageFiles(files, {
          title: `${diary.title} — Trip Recap`,
          text: `My ${diary.title} recap!`,
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

  async function handleDownload() {
    try {
      const file = await renderRecapImage(diary, selectedMemories, diaryId, pageOffset);
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      onShared?.('Recap downloaded!');
    } catch {
      onShared?.('Download failed.');
    }
  }

  return (
    <div className="recap-preview-page">
      <header className="recap-header">
        <button type="button" className="diary-back-btn" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="recap-header-title">Preview recap</h1>
        <button type="button" className="recap-download-btn" onClick={handleDownload} aria-label="Download">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </header>

      <div className="recap-preview-card">
        <div className="recap-preview-inner">
          <span className="recap-brand">travel recs</span>
          <h2 className="recap-preview-title">{diary.title}</h2>
          <div className="recap-photo-grid">
            {selectedMemories.slice(0, 9).map(m => (
              <div key={m.id} className="recap-grid-item">
                <div className="recap-grid-photo" />
                <span className="recap-grid-label">{m.location.split(' ')[0].toLowerCase()}</span>
              </div>
            ))}
          </div>
          <div className="recap-torn-edge" aria-hidden="true" />
          <div className="recap-preview-bottom">
            <p className="recap-favorites-title">favorites!</p>
            <ul className="recap-favorites-list">
              {selectedMemories.slice(0, 5).map(m => (
                <li key={m.id}>{m.location}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="recap-preview-actions">
        <button type="button" className="recap-secondary-btn" onClick={onGoDiary}>
          Go to diary
        </button>
        <button type="button" className="recap-primary-btn" onClick={() => setShowSheet(true)}>
          Share recap
        </button>
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
    </div>
  );
}
