import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { paths } from '../utils/appPaths';
import { addMemoFormAssets } from '../utils/addMemoFormAssets';
import { MEMO_TAG_OPTIONS } from '../data/memoTags';
import { hasChosenMemoLocation } from '../utils/memoDraft';
import { isNewMemoDirty } from '../utils/isNewMemoDirty';
import SectionTitle from './SectionTitle';
import AddMemoWarningModal from './AddMemoWarningModal';
import MemoTagIcon from './MemoTagIcon';
import { buildMemoMediaClassName, resolvePolaroidOrientation } from '../utils/memoPinAssets';
import { validateMemoMediaFile } from '../utils/validators';
import { containsProfanity, PROFANITY_ERROR_MESSAGE } from '../utils/profanityFilter';

const DESKTOP_OVERLAY_QUERY = '(min-width: 600px)';

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

function UploadIdleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.47656 0.5C7.62658 0.350028 7.97656 0 7.97656 0C7.97656 0 8.3281 0.365011 8.47812 0.514983C8.62813 0.664955 11.478 3.51488 11.478 3.51488L10.3469 4.64605L8.79971 3.1005V10.2011H7.19976V2.9245L5.47822 4.64605L4.34706 3.51488L7.47656 0.5ZM9.08971e-07 7.00117C9.08971e-07 6.789 1.60933e-06 6.20119 1.60933e-06 6.20119C1.60933e-06 6.20119 0.587808 6.20119 0.799974 6.20119H3.41749V7.80114H1.59995V17.4008H14.3995V7.80114H12.582V6.20119H15.1995C15.4117 6.20119 15.9995 6.20119 15.9995 6.20119C15.9995 6.20119 15.9995 6.789 15.9995 7.00117V18.2008C15.9995 18.413 15.9995 19.0008 15.9995 19.0008C15.9995 19.0008 15.4117 19.0008 15.1995 19.0008H0.799974C0.587808 19.0008 0 19.0008 0 19.0008C0 19.0008 9.08971e-07 18.413 9.08971e-07 18.2008V7.00117Z" fill="#1952FF" />
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

export default function NewMemoForm({ draft, fetcher, hidden = false, onClose }) {
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaPhase, setMediaPhase] = useState('idle');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingIsVideo, setLoadingIsVideo] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [quote, setQuote] = useState('');
  const [quoteTouched, setQuoteTouched] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const mediaPreviewRef = useRef(null);
  const loadTimerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const formRef = useRef(null);
  mediaPreviewRef.current = mediaPreview;

  const locationLabel = draft?.locationName?.trim() || 'Choose location';
  const locationHint = hasChosenMemoLocation(draft)
    ? 'Location selected'
    : 'Pick from map or use current location';
  const hasLocationName = Boolean(draft?.locationName?.trim());

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

  const hasLocation = hasChosenMemoLocation(draft);
  const mediaBlocking = mediaPhase === 'loading';
  const canSubmit = selectedTags.length > 0 && quoteValid && !mediaBlocking && !isSubmitting;
  const publishActive = canSubmit && hasLocation;

  const isDirty = useMemo(
    () => isNewMemoDirty({ quote, selectedTags, mediaPhase, draft }),
    [quote, selectedTags, mediaPhase, draft],
  );

  const locationPickerHref = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.set('step', 'location');
    return `?${next.toString()}`;
  }, [searchParams]);

  // Revoke blob URLs and clear fake upload timer when the form unmounts.
  useEffect(() => {
    return () => {
      if (loadTimerRef.current) clearInterval(loadTimerRef.current);
      if (mediaPreviewRef.current?.url) URL.revokeObjectURL(mediaPreviewRef.current.url);
    };
  }, []);

  // Hide location validation once a valid spot is chosen.
  useEffect(() => {
    if (hasLocation) setShowLocationError(false);
  }, [hasLocation]);

  // Keep ref in sync so close handler sees latest submit state.
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    if (!hidden) return;
    const root = formRef.current;
    if (!root) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && root.contains(focused)) {
      focused.blur();
    }
  }, [hidden]);

  useEffect(() => () => {
    const root = formRef.current;
    if (!root) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && root.contains(focused)) {
      focused.blur();
    }
  }, []);

  function requestClose() {
    if (isSubmittingRef.current || !isDirty) {
      onClose();
      return;
    }
    setWarningOpen(true);
  }

  function handleContinueEditing() {
    setWarningOpen(false);
  }

  function handleDiscard() {
    setWarningOpen(false);
    onClose();
  }

  function handleOverlayClick(event) {
    if (event.target !== event.currentTarget) return;
    if (!window.matchMedia(DESKTOP_OVERLAY_QUERY).matches) return;
    requestClose();
  }

  function clearLoadTimer() {
    if (loadTimerRef.current) {
      clearInterval(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }

  function handleFormSubmit(event) {
    if (!hasLocation) {
      event.preventDefault();
      setShowLocationError(true);
    }
    if (hasProfanity) {
      event.preventDefault();
      setQuoteTouched(true);
    }
  }

  async function applyMediaFile(file) {
    if (!file) return;

    if (file.size > MEDIA_MAX_BYTES) {
      setMediaPhase('oversize');
      setMediaPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
      return;
    }

    const result = validateMemoMediaFile(file);
    if (result.field) {
      if (result.message.includes('10 MB')) {
        setMediaPhase('oversize');
      }
      setMediaPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
      return;
    }
    if (!result.value) return;

    const isVideo = result.value.mediaType === 'video';
    setLoadingIsVideo(isVideo);
    setMediaPhase('loading');
    setLoadProgress(0);

    clearLoadTimer();
    loadTimerRef.current = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.random() * 14 + 4;
      });
    }, 120);

    const minDelay = new Promise((resolve) => {
      setTimeout(resolve, 450);
    });
    await minDelay;

    if (mediaPreview?.url) URL.revokeObjectURL(mediaPreview.url);
    const url = URL.createObjectURL(file);
    clearLoadTimer();
    setLoadProgress(100);
    const { readMediaDimensions } = await import('../utils/memoPinAssets');
    const { width, height } = await readMediaDimensions(file, { isVideo });
    setMediaPreview({ url, isVideo, file, width, height });
    setMediaPhase('preview');
  }

  function handleFileChange(e) {
    applyMediaFile(e.target.files?.[0]);
  }

  function handleCameraChange(e) {
    const file = e.target.files?.[0];
    if (file && fileRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileRef.current.files = transfer.files;
    }
    applyMediaFile(file);
  }

  function handleUploadClick() {
    fileRef.current?.click();
  }

  function handleCameraClick() {
    cameraRef.current?.click();
  }

  function handleRemoveMedia() {
    if (mediaPreview?.url) URL.revokeObjectURL(mediaPreview.url);
    setMediaPreview(null);
    setMediaPhase('idle');
    setLoadProgress(0);
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? [] : [tag]));
  }

  function renderMediaZone() {
    if (mediaPhase === 'preview' && mediaPreview) {
      const mediaClass = buildMemoMediaClassName(
        'memo-form-media-preview-img',
        resolvePolaroidOrientation({ mediaPreview }),
      );

      return (
        <div className="memo-form-media-preview">
          <div className="memo-form-media-preview-media">
            {mediaPreview.isVideo ? (
              <video src={mediaPreview.url} className={mediaClass} controls playsInline />
            ) : (
              <img src={mediaPreview.url} alt="Selected media" className={mediaClass} />
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
            <div
              className="memo-form-media-progress-fill"
              style={{ width: `${Math.min(100, loadProgress)}%` }}
            />
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
          <p className="memo-form-media-error-copy">
            The file exceeds 10 MB limit. Please select a smaller file.
          </p>
          <button type="button" className="memo-form-media-upload-btn" onClick={handleUploadClick}>
            Upload file
          </button>
        </div>
      );
    }

    return (
      <div className="memo-form-media-idle">
        <button type="button" className="memo-form-media-idle-upload" onClick={handleUploadClick}>
          <UploadIdleIcon />
        </button>
        <button type="button" className="memo-form-media-idle-link" onClick={handleUploadClick}>
          Tap to upload a file
        </button>
        <p className="memo-form-media-idle-hint">Add one image or video up to 10 MB.</p>
        <div className="memo-form-media-divider" aria-hidden="true">
          <span className="memo-form-media-divider-line" />
          <span className="memo-form-media-divider-label">OR</span>
          <span className="memo-form-media-divider-line" />
        </div>
        <button type="button" className="memo-form-media-camera-btn" onClick={handleCameraClick}>
          Open camera
        </button>
      </div>
    );
  }

  return (
    <>
    <fetcher.Form
      ref={formRef}
      method="post"
      action={paths.apiMemos}
      encType="multipart/form-data"
      onSubmit={handleFormSubmit}
      className={`form-overlay${hidden ? ' form-overlay--hidden' : ''}`}
      role={hidden ? undefined : 'dialog'}
      aria-modal={hidden ? undefined : true}
      inert={hidden ? true : undefined}
      aria-label="Add memo"
      onClick={handleOverlayClick}
    >
      <input type="hidden" name="intent" value="create-memo" />
      <input type="hidden" name="lat" value={draft?.lat ?? ''} />
      <input type="hidden" name="lng" value={draft?.lng ?? ''} />
      <input type="hidden" name="location" value={draft?.locationName?.trim() ?? ''} />
      <input type="hidden" name="placeId" value={draft?.placeId ?? ''} />
      {selectedTags.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}
      {mediaPreview?.width ? (
        <input type="hidden" name="mediaWidth" value={String(mediaPreview.width)} />
      ) : null}
      {mediaPreview?.height ? (
        <input type="hidden" name="mediaHeight" value={String(mediaPreview.height)} />
      ) : null}

      <div className="form-sheet memo-form-sheet">
        <div className="memo-form-scroll">
            <header className="memo-form-header header">
            <div className="memo-form-hero-deco" aria-hidden="true">
                <img className="memo-form-hero-grid" src={addMemoFormAssets.greenGrid} alt="" />
              <div className="memo-form-grid-pattern" />
              <img
                  className="memo-form-hero-wave"
                          src={addMemoFormAssets.waveArrow}
                          alt=""
                        />
            </div>

            <div className="memo-form-title-bar">
              <div className="memo-form-titles">
              <button type="button" className="memo-form-back-btn btn-chevron" onClick={requestClose} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1952FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h2 className="memo-form-title">Add memo</h2>
              </div>
              <img className="memo-form-camera-deco title-icon" src={addMemoFormAssets.camera} alt="" aria-hidden="true" />
            </div>
          </header>

          <div className="memo-form-media-zone">{renderMediaZone()}</div>

          <div className="memo-form-body">
          <section className="memo-form-section">
            <div className="memo-form-section-heading">
              <SectionTitle>Tell your story</SectionTitle>
            </div>
            <div className="section-input">
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
            </div>
          </section>

          <section className="memo-form-section">
            <div className="memo-form-section-heading">
              <SectionTitle>Tag your moment</SectionTitle>
            </div>
            <div className="section-input">
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
            </div>
          </section>

          <section className="memo-form-section memo-form-section--location">
            <div className="memo-form-section-heading">
              <SectionTitle>Add location</SectionTitle>
            </div>
            <div className="section-input">
            <p className="memo-form-section-copy">Help others find great locations</p>
            <Link to={locationPickerHref} replace className="memo-form-location-card">
              <div className="memo-form-location-icon" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="25" viewBox="0 0 18 25" fill="none">
                        <path d="M8.72402 0C3.90782 0 0 3.51742 0 7.85162C0 14.8308 8.72402 24.4273 8.72402 24.4273C8.72402 24.4273 17.448 14.8308 17.448 7.85162C17.448 3.51742 13.5402 0 8.72402 0ZM8.72402 12.2136C8.03384 12.2136 7.35916 12.009 6.7853 11.6255C6.21144 11.2421 5.76416 10.6971 5.50004 10.0594C5.23592 9.42179 5.16682 8.72015 5.30146 8.04323C5.43611 7.36631 5.76846 6.74452 6.25649 6.25649C6.74452 5.76846 7.36631 5.43611 8.04323 5.30146C8.72015 5.16682 9.42179 5.23592 10.0594 5.50004C10.6971 5.76416 11.2421 6.21143 11.6255 6.7853C12.009 7.35916 12.2136 8.03384 12.2136 8.72402C12.2126 9.64921 11.8446 10.5362 11.1904 11.1904C10.5362 11.8446 9.64921 12.2126 8.72402 12.2136Z" fill="#202020" />
                      </svg>
              </div>
              <div className="memo-form-location-copy">
                <span className={`memo-form-location-label${hasLocationName ? '' : ' memo-form-location-label--muted'}`}>
                  {locationLabel}
                </span>
                <span className="memo-form-location-sub">{locationHint}</span>
                {showLocationError && !hasLocation ? (
                  <span className="memo-form-location-error" role="status">
                    Choose a location before publishing.
                  </span>
                ) : null}
              </div>
                    <svg class="memo-form-location-chevron" xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14" fill="none">
                      <path d="M0.707031 0.707031L6.70703 6.70703L0.707031 12.707" stroke="#1952FF" stroke-width="2" />
                    </svg>
            </Link>
            </div>
          </section>

          {actionError === 'auth_required' && (
            <div className="auth-banner auth-banner--warning" role="alert">
              Log in to publish a memo.{' '}
              <Link to={paths.login} className="auth-switch-link">Log in</Link>
              {' or '}
              <Link to={paths.register} className="auth-switch-link">Create an account</Link>.
            </div>
          )}

          {actionError && actionError !== 'auth_required' && (
            <div className="auth-banner auth-banner--warning" role="alert">
              {actionError}
            </div>
          )}

          <div className="memo-form-footer">
            <button
              type="submit"
              className={`memo-form-publish-btn${publishActive ? ' memo-form-publish-btn--active' : ''}`}
              disabled={!canSubmit}
            >
              {isSubmitting ? 'Publishing…' : 'Publish'}
            </button>
          </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          name="media"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="memo-form-file-input"
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
          className="memo-form-file-input"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </fetcher.Form>

    <AddMemoWarningModal
      open={warningOpen}
      onContinue={handleContinueEditing}
      onDiscard={handleDiscard}
    />
    </>
  );
}
