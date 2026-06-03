import { useState, useRef } from 'react';

export default function NewMemoForm({ latlng, onClose, onPublish }) {
  const [mediaState, setMediaState] = useState('idle'); // 'idle' | 'zone' | 'preview'
  const [mediaPreview, setMediaPreview] = useState(null); // { url, isVideo }
  const [mediaFile, setMediaFile] = useState(null);
  const [quote, setQuote] = useState('');
  const fileRef = useRef(null);

  const locationLabel = latlng
    ? `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`
    : 'Choose location on map';

  function handleMediaAreaClick() {
    if (mediaState === 'idle') setMediaState('zone');
  }

  function handleUploadClick(e) {
    e.stopPropagation();
    fileRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview({ url, isVideo: file.type.startsWith('video') });
    setMediaState('preview');
  }

  function handleRemoveMedia(e) {
    e.stopPropagation();
    if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaState('idle');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handlePublish() {
    if (!quote.trim()) return;
    onPublish({ latlng, quote, mediaFile, mediaPreview });
  }

  const canPublish = quote.trim().length > 0;

  return (
    <div className="form-overlay" role="dialog" aria-modal="true" aria-label="New Memo">
      <div className="form-sheet">

        {/* Header */}
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

          {/* Media area */}
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
                  <p className="form-upload-size">10MB maximum media size</p>
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
            <span className="form-media-hint">max. 1 media file</span>
          </div>

          {/* Hidden file input — accepts image and video, works on mobile & desktop */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />

          {/* Quote */}
          <div className="form-section">
            <span className="form-label">What moment happened here?*</span>
            <p className="form-sublabel">Share your memory of this place</p>
            <textarea
              className="form-textarea"
              placeholder="I had the best kebab at 4AM here..."
              maxLength={100}
              value={quote}
              onChange={e => setQuote(e.target.value)}
              aria-label="Memory quote"
            />
            <p className="form-char-hint">max. 100 characters</p>
          </div>

          {/* Location */}
          <div className="form-location-row" role="button" tabIndex={0}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="form-location-label">{locationLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

        </div>

        {/* Publish */}
        <div className="form-footer">
          <button
            type="button"
            className={`form-publish-btn${canPublish ? ' form-publish-btn--active' : ''}`}
            disabled={!canPublish}
            onClick={handlePublish}
          >
            Publish
          </button>
        </div>

      </div>
    </div>
  );
}
