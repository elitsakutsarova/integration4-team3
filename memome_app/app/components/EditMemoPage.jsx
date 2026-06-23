import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAutoDismissSuccess } from '../hooks/useAutoDismissSuccess';
import { SUCCESS_MESSAGE_DISMISS_MS } from '../utils/successMessage';
import { useBlocker, useFetcher, useLocation, useNavigate } from 'react-router';
import MemoLocationPicker from './MemoLocationPicker';
import MemoPostSuccess from './MemoPostSuccess';
import EditMemoWarningModal from './EditMemoWarningModal';
import SectionTitle from './SectionTitle';
import MemoTagIcon from './MemoTagIcon';
import { addMemoFormAssets } from '../utils/addMemoFormAssets';
import { paths, readEditMemoReturnTo } from '../utils/appPaths';
import { MEMO_TAG_OPTIONS } from '../data/memoTags';
import { hasChosenMemoLocation } from '../utils/memoDraft';
import { containsProfanity, PROFANITY_ERROR_MESSAGE } from '../utils/profanityFilter';
import { isEditMemoDirty } from '../utils/isEditMemoDirty';
import { validateMemoMediaFile } from '../utils/validators';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useFetcherSubmitSuccess } from '../hooks/useFetcherSubmitSuccess';

const QUOTE_MAX = 100;
const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path d="M5.625 0V1.11111H0V3.33333H1.125V17.7778C1.125 18.3671 1.36205 18.9324 1.78401 19.3491C2.20597 19.7659 2.77826 20 3.375 20H14.625C15.2217 20 15.794 19.7659 16.216 19.3491C16.6379 18.9324 16.875 18.3671 16.875 17.7778V3.33333H18V1.11111H12.375V0H5.625ZM3.375 3.33333H14.625V17.7778H3.375V3.33333ZM5.625 5.55556V15.5556H7.875V5.55556H5.625ZM10.125 5.55556V15.5556H12.375V5.55556H10.125Z" fill="#FF4400" />
    </svg>
  );
}

function UploadIdleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.47656 0.5C7.62658 0.350028 7.97656 0 7.97656 0C7.97656 0 8.3281 0.365011 8.47812 0.514983C8.62813 0.664955 11.478 3.51488 11.478 3.51488L10.3469 4.64605L8.79971 3.1005V10.2011H7.19976V2.9245L5.47822 4.64605L4.34706 3.51488L7.47656 0.5ZM9.08971e-07 7.00117C9.08971e-07 6.789 1.60933e-06 6.20119 1.60933e-06 6.20119C1.60933e-06 6.20119 0.587808 6.20119 0.799974 6.20119H3.41749V7.80114H1.59995V17.4008H14.3995V7.80114H12.582V6.20119H15.1995C15.4117 6.20119 15.9995 6.20119 15.9995 6.20119C15.9995 6.20119 15.9995 6.789 15.9995 7.00117V18.2008C15.9995 18.413 15.9995 19.0008 15.9995 19.0008C15.9995 19.0008 15.4117 19.0008 15.1995 19.0008H0.799974C0.587808 19.0008 0 19.0008 0 19.0008C0 19.0008 9.08971e-07 18.413 9.08971e-07 18.2008V7.00117Z" fill="#1952FF" />
    </svg>
  );
}

function UploadErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L22.22 20.7H1.78L12 3Z" stroke="#797979" strokeWidth="2" strokeLinecap="square" />
      <path d="M12 10.5V14M12 17.5H12.004V17.504H12V17.5Z" stroke="#797979" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function MediaLoadingIcon({ isVideo }) {
  if (isVideo) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M2 2H33.5V33.5H2V2Z" stroke="#797979" strokeWidth="4" />
        <path d="M24.3125 17.75L12.5 24.5698V10.9303L24.3125 17.75Z" stroke="#797979" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
      <path d="M5.75 26.8333H28.75L21.5625 17.25L15.8125 24.9167L11.5 19.1667L5.75 26.8333ZM0 34.5V0H34.5V34.5H0ZM3.83333 30.6667H30.6667V3.83333H3.83333V30.6667Z" fill="#797979" />
    </svg>
  );
}

function buildInitialMedia(memo) {
  if (!memo?.mediaPreview?.url) return null;
  return {
    url: memo.mediaPreview.url,
    isVideo: Boolean(memo.mediaPreview.isVideo),
    width: memo.mediaPreview.width,
    height: memo.mediaPreview.height,
    file: null,
    isExisting: true,
  };
}

export default function EditMemoPage({ memo, returnToFromLoader = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fetcher = useFetcher({ key: `edit-memo-${memo.id}` });
  const { updateCreatedMemo } = useCreatedMemos();
  const returnToRef = useRef(undefined);
  if (returnToRef.current === undefined) {
    returnToRef.current = readEditMemoReturnTo(
      new URLSearchParams(location.search),
      location.state,
    ) ?? returnToFromLoader ?? paths.profileMemos;
  }
  const returnTo = returnToRef.current;

  const initialHadMedia = Boolean(memo?.mediaPreview?.url);
  const initialMedia = buildInitialMedia(memo);
  const [mediaPreview, setMediaPreview] = useState(initialMedia);
  const [mediaPhase, setMediaPhase] = useState(initialMedia ? 'preview' : 'idle');
  const [removeMedia, setRemoveMedia] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingIsVideo, setLoadingIsVideo] = useState(false);
  const [selectedTags, setSelectedTags] = useState(() => {
    const tags = memo.tags ?? [];
    return tags.length ? [tags[0]] : [];
  });
  const [quote, setQuote] = useState(memo.quote ?? '');
  const [quoteTouched, setQuoteTouched] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [pickLocationOpen, setPickLocationOpen] = useState(false);
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
  const isDiscardingRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const leaveTargetRef = useRef(returnTo);
  mediaPreviewRef.current = mediaPreview;

  const pickLocation = pickLocationOpen;
  const locationLabel = locationDraft.name?.trim() || 'Choose location';
  const hasLocationName = Boolean(locationDraft.name?.trim());
  const hasLocation = hasChosenMemoLocation({
    lat: locationDraft.lat,
    lng: locationDraft.lng,
    locationName: locationDraft.name,
  });
  const locationHint = hasLocation
    ? 'Tap to change location'
    : 'Pick from map or use current location';

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
  const canSubmit = selectedTags.length > 0 && quoteValid && !mediaBlocking && !isSubmitting;
  const publishActive = canSubmit && hasLocation;

  const isDirty = useMemo(
    () => isEditMemoDirty(memo, {
      quote,
      selectedTags,
      locationDraft,
      removeMedia,
      mediaPreview,
      initialHadMedia,
    }),
    [memo, quote, selectedTags, locationDraft, removeMedia, mediaPreview, initialHadMedia],
  );

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (isSubmittingRef.current || isDiscardingRef.current || !isDirty) return false;
    return currentLocation.pathname !== nextLocation.pathname;
  });

  // Revoke blob URLs and clear upload timer when leaving the edit page.
  useEffect(() => () => {
    if (loadTimerRef.current) clearInterval(loadTimerRef.current);
    const preview = mediaPreviewRef.current;
    if (preview?.url && !preview.isExisting) URL.revokeObjectURL(preview.url);
  }, []);

  useEffect(() => {
    leaveTargetRef.current = returnTo;
  }, [returnTo]);

  // useBlocker cannot open UI directly — sync blocked navigation to the warning modal.
  useEffect(() => {
    if (blocker.state === 'blocked') {
      leaveTargetRef.current = blocker.location?.pathname ?? returnTo;
      setWarningOpen(true);
    }
  }, [blocker.state, blocker.location?.pathname, returnTo]);

  useEffect(() => {
    if (hasLocation) setShowLocationError(false);
  }, [hasLocation]);

  const handleUpdateMemoSuccess = useCallback((data) => {
    isSubmittingRef.current = true;
    if (data.memo) updateCreatedMemo(data.memo);
    setShowSuccess(true);
  }, [updateCreatedMemo]);

  useFetcherSubmitSuccess(fetcher, {
    when: (data) => Boolean(data?.success && data?.kind === 'update'),
    onSuccess: handleUpdateMemoSuccess,
  });

  // Auto-return after the success modal is shown briefly.
  useEffect(() => {
    if (!showSuccess) return undefined;

    const timer = window.setTimeout(() => {
      navigate(returnTo, { replace: true });
    }, SUCCESS_MESSAGE_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [showSuccess, navigate, returnTo]);

  function handleBack() {
    if (!isDirty) {
      navigate(returnTo);
      return;
    }
    leaveTargetRef.current = returnTo;
    setWarningOpen(true);
  }

  function handleContinueEditing() {
    setWarningOpen(false);
    if (blocker.state === 'blocked') blocker.reset();
  }

  function handleDiscard() {
    isDiscardingRef.current = true;
    setWarningOpen(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
      return;
    }
    navigate(leaveTargetRef.current);
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
    const { readMediaDimensions } = await import('../utils/memoPinAssets');
    const { width, height } = await readMediaDimensions(file, { isVideo });
    setMediaPreview({ url, isVideo, file, width, height, isExisting: false });
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
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev;
      return [tag];
    });
  }

  function openLocationPicker() {
    setPickLocationOpen(true);
  }

  const handleLocationConfirm = useCallback(({ name, lat, lng, placeId = '' }) => {
    setLocationDraft({ lat, lng, name, placeId });
    setPickLocationOpen(false);
  }, []);

  const handleLocationBack = useCallback(() => {
    setPickLocationOpen(false);
  }, []);

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
        className={`edit-memo-page${pickLocation ? ' edit-memo-page--hidden' : ''}`}
        inert={pickLocation ? true : undefined}
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
        {mediaPreview?.width ? (
          <input type="hidden" name="mediaWidth" value={String(mediaPreview.width)} />
        ) : null}
        {mediaPreview?.height ? (
          <input type="hidden" name="mediaHeight" value={String(mediaPreview.height)} />
        ) : null}

        <header className="edit-memo-header memo-form-header">
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
              <button
                type="button"
                className="memo-form-back-btn btn-chevron"
                onClick={handleBack}
                aria-label="Back to created memos"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                  <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" strokeWidth="2.5" />
                </svg>
              </button>
              <h1 className="memo-form-title">Edit memo</h1>
            </div>
            <img className="memo-form-camera-deco title-icon" src={addMemoFormAssets.camera} alt="" aria-hidden="true" />
          </div>
        </header>

        <div className="edit-memo-media memo-form-media-zone">{renderMediaZone()}</div>

        <div className="edit-memo-body memo-form-body">
          <section className="memo-form-section" aria-labelledby="memo-story-heading">
            <div className="memo-form-section-heading">
              <SectionTitle id="memo-story-heading">Tell your story</SectionTitle>
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

          <section className="memo-form-section" aria-labelledby="memo-tags-heading">
            <div className="memo-form-section-heading">
              <SectionTitle id="memo-tags-heading">Tag your moment</SectionTitle>
            </div>
            <div className="section-input">
              <p className="memo-form-section-copy">Help others find similar experiences</p>
              <div className="memo-form-tag-scroll" role="group" aria-label="Memo tags">
                <div className="map-category-row">
                  {MEMO_TAG_OPTIONS.map((tag) => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`map-category-chip${selected ? ' map-category-chip--active' : ''}`}
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

          <section className="memo-form-section memo-form-section--location" aria-labelledby="memo-location-heading">
            <div className="memo-form-section-heading">
              <SectionTitle id="memo-location-heading">Add location</SectionTitle>
            </div>
            <div className="section-input">
              <p className="memo-form-section-copy">Help others find great locations</p>
              <button
                type="button"
                className="memo-form-location-card"
                onClick={openLocationPicker}
              >
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
                <svg className="memo-form-location-chevron" xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14" fill="none">
                  <path d="M0.707031 0.707031L6.70703 6.70703L0.707031 12.707" stroke="#1952FF" strokeWidth="2" />
                </svg>
              </button>
            </div>
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
              {isSubmitting ? 'Saving…' : 'Save changes'}
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
          accept="image/*,video/*,video/mp4,video/quicktime,video/webm"
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
          dismissible={false}
        />
      )}

      <EditMemoWarningModal
        open={warningOpen}
        onContinue={handleContinueEditing}
        onDiscard={handleDiscard}
      />
    </>
  );
}
