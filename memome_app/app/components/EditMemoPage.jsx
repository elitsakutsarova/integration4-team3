import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useFetcher, useNavigate, useSearchParams } from 'react-router';
import MemoLocationPicker from './MemoLocationPicker';
import MemoPostSuccess from './MemoPostSuccess';
import SectionTitle from './SectionTitle';
import { addMemoFormAssets } from '../utils/addMemoFormAssets';
import { paths } from '../utils/appPaths';
import { MEMO_TAG_OPTIONS } from '../data/memoTags';
import { containsProfanity, PROFANITY_ERROR_MESSAGE } from '../utils/profanityFilter';
import { validateMemoMediaFile } from '../utils/validators';
import { useCreatedMemos } from '../context/CreatedMemosContext';

const QUOTE_MAX = 100;
const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MemoTagIcon({ tag }) {
  if (tag === 'Food') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 11h18M6 11V5a2 2 0 0 1 2-2h1v8M11 3v8M16 11V7a2 2 0 0 1 2-2h1v6" />
      </svg>
    );
  }
  if (tag === 'Nightlife') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M8 22h8M12 11v11M7 11l5-8 5 8H7z" />
      </svg>
    );
  }
  if (tag === 'Fashion') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 2l3 4h6l3-4M6 6l-2 16h16L18 6" />
      </svg>
    );
  }
  if (tag === 'Art & Culture') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
      </svg>
    );
  }
  if (tag === 'Music') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h16v16H4z" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

function UploadIdleIcon() {
  return (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none" aria-hidden="true">
      <circle cx="18.5" cy="18.5" r="18.5" fill="#E8E8EC" />
      <path d="M18.5 11v10M13.5 16l5-5 5 5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 24h15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UploadErrorIcon() {
  return (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none" aria-hidden="true">
      <circle cx="18.5" cy="18.5" r="18.5" fill="#E8E8EC" />
      <path d="M18.5 12v10" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18.5" cy="26" r="1.5" fill="#9CA3AF" />
    </svg>
  );
}

function MediaLoadingIcon({ isVideo }) {
  if (isVideo) {
    return (
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
        <rect x="4" y="10" width="38" height="26" rx="4" stroke="#9CA3AF" strokeWidth="2" />
        <path d="M20 18l10 5-10 5V18z" fill="#9CA3AF" />
      </svg>
    );
  }
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="34" height="26" rx="4" stroke="#9CA3AF" strokeWidth="2" />
      <circle cx="16" cy="19" r="3" fill="#9CA3AF" />
      <path d="M6 30l9-9 7 7 6-6 12 12" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function buildInitialMedia(memo) {
  if (!memo?.mediaPreview?.url) return null;
  return {
    url: memo.mediaPreview.url,
    isVideo: Boolean(memo.mediaPreview.isVideo),
    file: null,
    isExisting: true,
  };
}

export default function EditMemoPage({ memo }) {
  const navigate = useNavigate();
  const fetcher = useFetcher({ key: `edit-memo-${memo.id}` });
  const { updateCreatedMemo } = useCreatedMemos();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMedia = buildInitialMedia(memo);
  const [mediaPreview, setMediaPreview] = useState(initialMedia);
  const [mediaPhase, setMediaPhase] = useState(initialMedia ? 'preview' : 'idle');
  const [removeMedia, setRemoveMedia] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingIsVideo, setLoadingIsVideo] = useState(false);
  const [selectedTags, setSelectedTags] = useState(memo.tags ?? []);
  const [quote, setQuote] = useState(memo.quote ?? '');
  const [quoteTouched, setQuoteTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationDraft, setLocationDraft] = useState({
    lat: memo.ll?.[0] ?? null,
    lng: memo.ll?.[1] ?? null,
    name: memo.location ?? '',
    placeId: memo.placeId ?? '',
  });

  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const mediaPreviewRef = useRef(null);
  const loadTimerRef = useRef(null);
  const handledSubmitRef = useRef(false);
  mediaPreviewRef.current = mediaPreview;

  const pickLocation = searchParams.get('step') === 'location';
  const hasLocation = Number.isFinite(locationDraft.lat)
    && Number.isFinite(locationDraft.lng)
    && Boolean(locationDraft.name?.trim());

  const isSubmitting = fetcher.state !== 'idle';
  const actionError = fetcher.state === 'idle' ? fetcher.data?.error : undefined;
  const hasProfanity = containsProfanity(quote);
  const quoteValid = quote.trim().length > 0 && !hasProfanity;
  const quoteFeedback = quoteTouched
    ? !quote.trim()
      ? { tone: 'error', message: 'Required field! Please describe memo.' }
      : hasProfanity
        ? { tone: 'error', message: PROFANITY_ERROR_MESSAGE }
        : { tone: 'success', message: 'Looks great! Proceed to the next field.' }
    : null;

  const mediaBlocking = mediaPhase === 'loading';
  const canSubmit = selectedTags.length > 0 && quoteValid && hasLocation && !mediaBlocking && !isSubmitting;
  const publishActive = canSubmit;

  const locationPickerHref = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.set('step', 'location');
    return `?${next.toString()}`;
  }, [searchParams]);

  useEffect(() => () => {
    if (loadTimerRef.current) clearInterval(loadTimerRef.current);
    const preview = mediaPreviewRef.current;
    if (preview?.url && !preview.isExisting) URL.revokeObjectURL(preview.url);
  }, []);

  useEffect(() => {
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      handledSubmitRef.current = false;
      return;
    }
    if (fetcher.state !== 'idle' || handledSubmitRef.current) return;
    if (!fetcher.data?.success || fetcher.data?.kind !== 'update') return;

    handledSubmitRef.current = true;
    if (fetcher.data.memo) updateCreatedMemo(fetcher.data.memo);
    setShowSuccess(true);
  }, [fetcher.state, fetcher.data, updateCreatedMemo]);

  function clearLoadTimer() {
    if (loadTimerRef.current) {
      clearInterval(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }

  function handleFormSubmit(event) {
    if (!hasLocation || hasProfanity) {
      event.preventDefault();
      if (hasProfanity) setQuoteTouched(true);
    }
  }

  async function applyMediaFile(file) {
    if (!file) return;

    if (file.size > MEDIA_MAX_BYTES) {
      setMediaPhase('oversize');
      setMediaPreview(null);
      setRemoveMedia(true);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
      return;
    }

    const result = validateMemoMediaFile(file);
    if (result.field) {
      if (result.message.includes('10 MB')) setMediaPhase('oversize');
      setMediaPreview(null);
      setRemoveMedia(true);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
      return;
    }
    if (!result.value) return;

    const isVideo = result.value.mediaType === 'video';
    setLoadingIsVideo(isVideo);
    setMediaPhase('loading');
    setLoadProgress(0);
    setRemoveMedia(false);

    clearLoadTimer();
    loadTimerRef.current = setInterval(() => {
      setLoadProgress((prev) => (prev >= 92 ? prev : prev + Math.random() * 14 + 4));
    }, 120);

    await new Promise((resolve) => { setTimeout(resolve, 450); });

    const previous = mediaPreviewRef.current;
    if (previous?.url && !previous.isExisting) URL.revokeObjectURL(previous.url);
    const url = URL.createObjectURL(file);
    clearLoadTimer();
    setLoadProgress(100);
    setMediaPreview({ url, isVideo, file, isExisting: false });
    setMediaPhase('preview');
  }

  function handleRemoveMedia() {
    const previous = mediaPreview;
    if (previous?.url && !previous.isExisting) URL.revokeObjectURL(previous.url);
    setMediaPreview(null);
    setMediaPhase('idle');
    setLoadProgress(0);
    setRemoveMedia(true);
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  }

  const handleLocationConfirm = useCallback(({ name, lat, lng, placeId = '' }) => {
    setLocationDraft({ lat, lng, name, placeId });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('step');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleLocationBack = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('step');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  function handleSuccessClose() {
    setShowSuccess(false);
    navigate(paths.profileMemos);
  }

  function renderMediaZone() {
    if (mediaPhase === 'preview' && mediaPreview) {
      return (
        <div className="memo-form-media-preview">
          <div className="memo-form-media-preview-media">
            {mediaPreview.isVideo ? (
              <video src={mediaPreview.url} className="memo-form-media-preview-img" controls playsInline />
            ) : (
              <img src={mediaPreview.url} alt="Memo media" className="memo-form-media-preview-img" />
            )}
            <button
              type="button"
              className="memo-form-media-preview-remove"
              onClick={handleRemoveMedia}
              aria-label="Remove media"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      );
    }

    if (mediaPhase === 'loading') {
      return (
        <div className="memo-form-media-loading">
          <MediaLoadingIcon isVideo={loadingIsVideo} />
          <p className="memo-form-media-loading-percent">{Math.round(loadProgress)}%</p>
          <div className="memo-form-media-progress" aria-hidden="true">
            <div className="memo-form-media-progress-fill" style={{ width: `${Math.min(100, loadProgress)}%` }} />
          </div>
          <p className="memo-form-media-loading-copy">Uploading your media...</p>
        </div>
      );
    }

    if (mediaPhase === 'oversize') {
      return (
        <div className="memo-form-media-error">
          <UploadErrorIcon />
          <p className="memo-form-media-error-title">Oops! File is too large</p>
          <p className="memo-form-media-error-copy">The file exceeds 10 MB limit. Please select a smaller file.</p>
          <button type="button" className="memo-form-media-upload-btn" onClick={() => fileRef.current?.click()}>
            Upload file
          </button>
        </div>
      );
    }

    return (
      <div className="memo-form-media-idle">
        <button type="button" className="memo-form-media-idle-upload" onClick={() => fileRef.current?.click()}>
          <UploadIdleIcon />
        </button>
        <button type="button" className="memo-form-media-idle-link" onClick={() => fileRef.current?.click()}>
          Tap to upload a file
        </button>
        <p className="memo-form-media-idle-hint">Add one image or video up to 10 MB.</p>
        <div className="memo-form-media-divider" aria-hidden="true">
          <span className="memo-form-media-divider-line" />
          <span className="memo-form-media-divider-label">OR</span>
          <span className="memo-form-media-divider-line" />
        </div>
        <button type="button" className="memo-form-media-camera-btn" onClick={() => cameraRef.current?.click()}>
          Open camera
        </button>
      </div>
    );
  }

  return (
    <>
      <fetcher.Form
        method="post"
        action={paths.apiMemos}
        encType="multipart/form-data"
        onSubmit={handleFormSubmit}
        className="edit-memo-page"
      >
        <input type="hidden" name="intent" value="update-memo" />
        <input type="hidden" name="memoId" value={memo.id} />
        <input type="hidden" name="lat" value={locationDraft.lat ?? ''} />
        <input type="hidden" name="lng" value={locationDraft.lng ?? ''} />
        <input type="hidden" name="location" value={locationDraft.name?.trim() ?? ''} />
        <input type="hidden" name="placeId" value={locationDraft.placeId ?? ''} />
        {removeMedia ? <input type="hidden" name="removeMedia" value="true" /> : null}
        {selectedTags.map((tag) => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}

        <header className="edit-memo-header memo-form-header">
          <div className="memo-form-hero-deco" aria-hidden="true">
            <div className="memo-form-grid-gradient" />
            <div className="memo-form-grid-pattern" />
            <div className="memo-form-pixel-deco">
              <span /><span /><span /><span />
            </div>
          </div>

          <div className="memo-form-title-bar">
            <button
              type="button"
              className="memo-form-back-btn"
              onClick={() => navigate(paths.profileMemos)}
              aria-label="Back to created memos"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1952FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="memo-form-title">Edit memo</h1>
            <img className="memo-form-camera-deco" src={addMemoFormAssets.camera} alt="" aria-hidden="true" />
          </div>
        </header>

        <div className="edit-memo-media memo-form-media-zone">{renderMediaZone()}</div>

        <div className="edit-memo-body memo-form-body">
          <section className="memo-form-section">
            <div className="memo-form-section-heading">
              <SectionTitle>Tell your story</SectionTitle>
            </div>
            <p className="memo-form-section-copy">Describe a moment that happened here</p>
            <div className="memo-form-quote-wrap">
              <textarea
                className={`memo-form-textarea${quoteFeedback?.tone === 'error' ? ' memo-form-textarea--error' : ''}${quoteFeedback?.tone === 'success' ? ' memo-form-textarea--success' : ''}`}
                name="quote"
                placeholder="I had the best kebab at 4 am here..."
                maxLength={QUOTE_MAX}
                value={quote}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuote(value);
                  if (containsProfanity(value)) setQuoteTouched(true);
                }}
                onBlur={() => setQuoteTouched(true)}
                aria-label="Memory quote"
                aria-invalid={quoteFeedback?.tone === 'error'}
              />
              {quote.length > 0 && (
                <p className="memo-form-char-counter" aria-live="polite">
                  {quote.length}/{QUOTE_MAX} characters used
                </p>
              )}
            </div>
            <div className="memo-form-field-meta">
              {quoteFeedback && (
                <p className={`memo-form-field-feedback memo-form-field-feedback--${quoteFeedback.tone}`} role="status">
                  {quoteFeedback.message}
                </p>
              )}
              <p className="memo-form-char-hint">max. {QUOTE_MAX} characters</p>
            </div>
          </section>

          <section className="memo-form-section">
            <div className="memo-form-section-heading">
              <SectionTitle>Tag your moment</SectionTitle>
            </div>
            <p className="memo-form-section-copy">Help others find similar experiences</p>
            <div className="memo-form-tag-scroll" role="group" aria-label="Memo tags">
              <div className="memo-form-tag-row">
                {MEMO_TAG_OPTIONS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`memo-form-tag-chip${selected ? ' memo-form-tag-chip--selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag)}
                    >
                      <MemoTagIcon tag={tag} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="memo-form-section memo-form-section--location">
            <div className="memo-form-section-heading">
              <SectionTitle>Add location</SectionTitle>
            </div>
            <p className="memo-form-section-copy">Help others find great locations</p>
            <Link to={locationPickerHref} replace className="memo-form-location-card">
              <div className="memo-form-location-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="memo-form-location-copy">
                <span className={`memo-form-location-label${locationDraft.name?.trim() ? '' : ' memo-form-location-label--muted'}`}>
                  {locationDraft.name?.trim() || 'Choose location'}
                </span>
                <span className="memo-form-location-sub">
                  {hasLocation ? 'Location selected' : 'Pick from map or use current location'}
                </span>
              </div>
              <svg className="memo-form-location-chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1952FF" strokeWidth="2" aria-hidden="true">
                <path d="M1 1l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </section>

          {actionError && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {actionError}
            </div>
          )}

          <div className="memo-form-footer edit-memo-footer">
            <button
              type="submit"
              className={`memo-form-publish-btn${publishActive ? ' memo-form-publish-btn--active' : ''}`}
              disabled={!canSubmit}
            >
              {isSubmitting ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          name="media"
          accept="image/*,video/*"
          onChange={(e) => applyMediaFile(e.target.files?.[0])}
          className="memo-form-file-input"
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && fileRef.current) {
              const transfer = new DataTransfer();
              transfer.items.add(file);
              fileRef.current.files = transfer.files;
            }
            applyMediaFile(file);
          }}
          className="memo-form-file-input"
          aria-hidden="true"
          tabIndex={-1}
        />
      </fetcher.Form>

      {pickLocation && (
        <MemoLocationPicker
          initialLat={locationDraft.lat}
          initialLng={locationDraft.lng}
          initialName={locationDraft.name}
          mapPinLat={locationDraft.lat}
          mapPinLng={locationDraft.lng}
          onBack={handleLocationBack}
          onConfirm={handleLocationConfirm}
        />
      )}

      {showSuccess && (
        <MemoPostSuccess
          description="Your memo was edited"
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}
