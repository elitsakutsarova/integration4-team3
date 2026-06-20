// memory sheet component for the map view

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { useSavedMemos } from '../context/SavedMemosContext';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../utils/googleMaps';
import {
  buildMemoMediaClassName,
  readMediaDimensions,
  resolvePolaroidOrientation,
} from '../utils/memoPinAssets';
import { buildMemorySheetTags } from '../utils/memoAuthor';
import { paths } from '../utils/appPaths';
import {
  buildMapPopupDockTransform,
  getMapPopupScale,
} from '../utils/mapPopupScale';

function MemoFavoriteButton({ memoId, label, onSaved }) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const saved = isSaved(memoId);

  return (
    <button
      type="button"
      className={`memory-sheet-heart${saved ? ' memory-sheet-heart--saved' : ''}`}
      aria-label={saved ? `Remove ${label} from favourites` : `Save ${label} to favourites`}
      aria-pressed={saved}
      onClick={event => {
        event.stopPropagation();
        void toggleMemo(memoId).then(added => {
          if (added) onSaved?.();
        });
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="#1952ff"
          strokeWidth="1.8"
          fill={saved ? '#1952ff' : 'none'}
        />
      </svg>
    </button>
  );
}

function MemoTags({ tags, className = '' }) {
  if (!tags?.length) return null;

  return (
    <ul className={`memory-sheet-tags${className ? ` ${className}` : ''}`}>
      {tags.map(tag => (
        <li key={tag} className="memory-sheet-tag">{tag}</li>
      ))}
    </ul>
  );
}

const LONG_QUOTE_CHAR_THRESHOLD = 50;

function isLongQuoteByLength(quote) {
  return String(quote ?? '').trim().length > LONG_QUOTE_CHAR_THRESHOLD;
}

function useLongQuote(quote, layoutKey) {
  const quoteRef = useRef(null);
  const [isLongQuote, setIsLongQuote] = useState(() => isLongQuoteByLength(quote));

  useLayoutEffect(() => {
    const el = quoteRef.current;
    if (!el) {
      setIsLongQuote(isLongQuoteByLength(quote));
      return;
    }

    const styles = getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24;
    const paddingY = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const isMultiline = el.scrollHeight > lineHeight + paddingY + 2;

    setIsLongQuote(isMultiline || isLongQuoteByLength(quote));
  }, [quote, layoutKey]);

  return { quoteRef, isLongQuote };
}

export default function MemorySheet({ pin, onClose, onMemoSaved }) {
  const ignoreBackdropClickRef = useRef(true);
  const fetcher = useFetcher({ key: `location-href-${pin?.id}` });

  const locationHref = fetcher.data?.href ?? null;

  useEffect(() => {
    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 450);
    return () => window.clearTimeout(timer);
  }, [pin?.id]);

  useEffect(() => {
    if (!pin || fetcher.state !== 'idle' || fetcher.data !== undefined) return;
    const params = new URLSearchParams({
      placeId: pin.placeId ?? '',
      lat: String(pin.ll?.[0] ?? ''),
      lng: String(pin.ll?.[1] ?? ''),
      name: pin.location ?? '',
    });
    fetcher.load(`${paths.apiLocationHref}?${params}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.id]);

  const hasMedia = Boolean(pin?.mediaPreview?.url);
  const [orientation, setOrientation] = useState(() => resolvePolaroidOrientation(pin));
  const [mediaSheetScale, setMediaSheetScale] = useState(1);
  const { quoteRef, isLongQuote } = useLongQuote(
    pin?.quote,
    hasMedia ? `${mediaSheetScale}:${orientation}` : 'text-only',
  );

  useEffect(() => {
    if (!hasMedia) {
      setMediaSheetScale(1);
      return undefined;
    }

    function updateScale() {
      setMediaSheetScale(getMapPopupScale());
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [hasMedia]);

  useEffect(() => {
    if (!pin?.mediaPreview?.url) {
      setOrientation('vertical');
      return undefined;
    }

    const storedWidth = Number(pin.mediaPreview.width);
    const storedHeight = Number(pin.mediaPreview.height);
    if (Number.isFinite(storedWidth) && Number.isFinite(storedHeight) && storedWidth > 0 && storedHeight > 0) {
      setOrientation(storedWidth >= storedHeight ? 'horizontal' : 'vertical');
      return undefined;
    }

    let cancelled = false;
    readMediaDimensions(pin.mediaPreview.url, { isVideo: Boolean(pin.mediaPreview.isVideo) })
      .then(({ width, height }) => {
        if (cancelled || !width || !height) return;
        setOrientation(width >= height ? 'horizontal' : 'vertical');
      });

    return () => {
      cancelled = true;
    };
  }, [pin?.id, pin?.mediaPreview?.url, pin?.mediaPreview?.width, pin?.mediaPreview?.height, pin?.mediaPreview?.isVideo]);

  if (!pin) return null;

  const canOpenMaps = Array.isArray(pin.ll) && pin.ll.length >= 2;
  const sheetTags = buildMemorySheetTags(pin);
  const dockTransform = buildMapPopupDockTransform(mediaSheetScale);
  const dockTransformOrigin = mediaSheetScale === 1 ? undefined : 'center bottom';

  function handleTakeMeThere(event) {
    event.stopPropagation();
    if (!canOpenMaps) {
      event.preventDefault();
      return;
    }
    openGoogleMapsDirections(pin.ll[0], pin.ll[1], event);
  }

  return (
    <div
      className="memory-sheet-backdrop memory-sheet-backdrop--dock"
      onClick={() => {
        if (ignoreBackdropClickRef.current) return;
        onClose();
      }}
    >
      <article
        className={[
          'memory-sheet',
          'memory-sheet--dock',
          hasMedia ? 'memory-sheet--with-media' : 'memory-sheet--text-only',
        ].filter(Boolean).join(' ')}
        style={{
          transform: dockTransform,
          transformOrigin: dockTransformOrigin,
        }}
        onClick={event => event.stopPropagation()}
      >
        <div className="memory-sheet-dock-motion">
          <div
            className={[
              'memory-sheet-body',
              isLongQuote ? 'memory-sheet-body--long-quote' : '',
              hasMedia && orientation === 'vertical' ? 'memory-sheet-body--vertical-media' : '',
            ].filter(Boolean).join(' ')}
          >
            {hasMedia ? (
              <section className="memory-sheet-media" aria-label="Memo photo">
                <div className="memory-sheet-media-toolbar">
                  <MemoFavoriteButton
                    memoId={pin.id}
                    label={pin.location}
                    onSaved={onMemoSaved}
                  />
                </div>
                <div className={`memory-sheet-polaroid memory-sheet-polaroid--${orientation}`}>
                  <div className="memory-sheet-polaroid-frame">
                    <div className="memory-sheet-polaroid-photo">
                      {pin.mediaPreview.isVideo
                        ? (
                          <video
                            src={pin.mediaPreview.url}
                            className={buildMemoMediaClassName('memory-sheet-preview-img', orientation)}
                            controls
                            playsInline
                          />
                        )
                        : (
                          <img
                            src={pin.mediaPreview.url}
                            alt=""
                            className={buildMemoMediaClassName('memory-sheet-preview-img', orientation)}
                          />
                        )}
                    </div>
                  </div>
                </div>
                <MemoTags tags={sheetTags} />
              </section>
            ) : (
              <header className="memory-sheet-text-only-head">
                <MemoTags tags={sheetTags} className="memory-sheet-tags--inline" />
                <MemoFavoriteButton
                  memoId={pin.id}
                  label={pin.location}
                  onSaved={onMemoSaved}
                />
              </header>
            )}

            <p ref={quoteRef} className="memory-sheet-quote">{pin.quote}</p>

            <footer className="memory-sheet-actions">
              <div className="memory-sheet-location">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="19" viewBox="0 0 14 19" fill="none" aria-hidden="true">
                  <path d="M6.5625 0C2.93959 0 0 2.64592 0 5.90625C0 11.1562 6.5625 18.375 6.5625 18.375C6.5625 18.375 13.125 11.1562 13.125 5.90625C13.125 2.64592 10.1854 0 6.5625 0ZM6.5625 9.1875C6.04332 9.1875 5.53581 9.03355 5.10413 8.74511C4.67245 8.45667 4.336 8.0467 4.13732 7.56704C3.93864 7.08739 3.88665 6.55959 3.98794 6.05039C4.08922 5.54119 4.33923 5.07346 4.70634 4.70634C5.07346 4.33923 5.54119 4.08922 6.05039 3.98794C6.55959 3.88665 7.08739 3.93864 7.56704 4.13732C8.0467 4.336 8.45667 4.67245 8.74511 5.10413C9.03355 5.53581 9.1875 6.04332 9.1875 6.5625C9.18674 7.25846 8.90993 7.9257 8.41782 8.41782C7.9257 8.90993 7.25846 9.18674 6.5625 9.1875Z" fill="#9CA3AF" />
                </svg>
                {locationHref ? (
                  <Link
                    to={locationHref}
                    className="memory-sheet-location-name"
                    onClick={onClose}
                  >
                    {pin.location}
                  </Link>
                ) : (
                  <span className="memory-sheet-location-name memory-sheet-location-name--plain">
                    {pin.location}
                  </span>
                )}
              </div>
              {canOpenMaps && (
                <a
                  href={buildGoogleMapsDirectionsUrl(pin.ll[0], pin.ll[1])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="memory-sheet-cta"
                  onClick={handleTakeMeThere}
                >
                  Take me there
                </a>
              )}
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}
