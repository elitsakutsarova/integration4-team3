import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { MEMO_TAG_OPTIONS } from '../data/memoTags';
import { MEMO_MAX_MEDIA_BYTES } from '../utils/memoStore';

export default function NewMemoForm({ latlng, fetcher, onClose }) {
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const fileRef = useRef(null);

  const mediaState = mediaPreview ? 'preview' : showUploadZone ? 'zone' : 'idle';

  const locationLabel = latlng
    ? `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`
    : 'Choose location on map';

  const isSubmitting = fetcher.state !== 'idle';
  const actionError = fetcher.state === 'idle' ? fetcher.data?.error : undefined;
  const canPublish = selectedTags.length > 0 && !mediaError && !isSubmitting;

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
    };
  }, [mediaPreview]);

  function handleMediaAreaClick() {
    if (mediaState === 'idle') setShowUploadZone(true);
  }

  function handleUploadClick(e) {
    e.stopPropagation();
    fileRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MEMO_MAX_MEDIA_BYTES) {
      setMediaError('Media must be under 10 MB.');
      setMediaPreview(null);
      setShowUploadZone(true);
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setMediaError('Only images and videos are allowed.');
      setMediaPreview(null);
      setShowUploadZone(true);
      e.target.value = '';
      return;
    }

    setMediaError('');
    const url = URL.createObjectURL(file);
    setShowUploadZone(false);
    setMediaPreview({ url, isVideo: file.type.startsWith('video/') });
  }

  function handleRemoveMedia(e) {
    e.stopPropagation();
    if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
    setMediaPreview(null);
    setShowUploadZone(false);
    setMediaError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  }

  return (
    <fetcher.Form
      method="post"
      encType="multipart/form-data"
      className="form-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="New Memo"
    >
      <input type="hidden" name="intent" value="create-memo" />
      <input type="hidden" name="lat" value={latlng?.lat ?? ''} />
      <input type="hidden" name="lng" value={latlng?.lng ?? ''} />
      <input type="hidden" name="location" value="My spot" />
      {selectedTags.map(tag => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}

      <div className="form-sheet">

        <div className="form-header">
          <button type="button" className="form-close-btn" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
          <h2 className="form-title">New Memo</h2>
          <div className="form-header-spacer" />
        </div>

        <div className="form-scrollable">

          <div className="form-media-section">
            <div
              className="form-media-area"
              onClick={handleMediaAreaClick}
              role={mediaState === 'idle' ? 'button' : undefined}
              tabIndex={mediaState === 'idle' ? 0 : undefined}
              onKeyDown={mediaState === 'idle' ? e => e.key === 'Enter' && handleMediaAreaClick() : undefined}
            >
              {mediaState === 'idle' && (
                <div className="form-media-placeholder">
                  <div className="form-media-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Media</span>
                  </div>
                </div>
              )}

              {mediaState === 'zone' && (
                <div className="form-upload-zone" onClick={e => e.stopPropagation()}>
                  <p className="form-upload-size">10 MB maximum media size</p>
                  <button type="button" className="form-upload-btn" onClick={handleUploadClick}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    Upload media
                  </button>
                </div>
              )}

              {mediaState === 'preview' && mediaPreview && (
                <div className="form-media-preview-wrap">
                  {mediaPreview.isVideo
                    ? <video src={mediaPreview.url} className="form-media-img" controls playsInline />
                    : <img src={mediaPreview.url} alt="Selected media" className="form-media-img" />
                  }
                  <button type="button" className="form-media-remove" onClick={handleRemoveMedia} aria-label="Remove media">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="1" y1="1" x2="11" y2="11" />
                      <line x1="11" y1="1" x2="1" y2="11" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <span className="form-media-hint">max. 1 photo or video, up to 10 MB</span>
          </div>

          <input
            ref={fileRef}
            type="file"
            name="media"
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />

          {mediaError && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {mediaError}
            </div>
          )}

          <div className="form-section">
            <span className="form-label">What moment happened here?*</span>
            <p className="form-sublabel">Share your memory of this place</p>
            <textarea
              className="form-textarea"
              name="quote"
              placeholder="I had the best kebab at 4AM here..."
              maxLength={100}
              required
              aria-label="Memory quote"
            />
            <p className="form-char-hint">max. 100 characters</p>
          </div>

          <div className="form-section">
            <span className="form-label">Tags*</span>
            <p className="form-sublabel">Pick one or more</p>
            <div className="form-tag-list" role="group" aria-label="Memo tags">
              {MEMO_TAG_OPTIONS.map(tag => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`form-tag-chip${selected ? ' form-tag-chip--selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-location-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="form-location-label">{locationLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {actionError === 'auth_required' && (
            <div className="auth-banner auth-banner--warning" role="alert">
              Log in to publish a memo.{' '}
              <Link to="/login" className="auth-switch-link">Log in</Link>
              {' or '}
              <Link to="/register" className="auth-switch-link">Create an account</Link>.
            </div>
          )}

          {actionError && actionError !== 'auth_required' && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {actionError}
            </div>
          )}

        </div>

        <div className="form-footer">
          <button
            type="submit"
            className={`form-publish-btn${canPublish ? ' form-publish-btn--active' : ''}`}
            disabled={!canPublish}
          >
            {isSubmitting ? 'Publishing…' : 'Publish'}
          </button>
        </div>

      </div>
    </fetcher.Form>
  );
}
