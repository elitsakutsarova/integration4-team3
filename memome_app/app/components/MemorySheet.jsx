// memory sheet component for the map view and embedded profile memo lists

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import MemoFavoriteButton from './MemoFavoriteButton';
import VisuallyHiddenTitle from './VisuallyHiddenTitle';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../utils/googleMaps';
import {
  buildMemoMediaClassName,
  readMediaDimensions,
  resolvePolaroidOrientation,
} from '../utils/memoPinAssets';
import { buildMemorySheetTags } from '../utils/memoAuthor';
import {
  MAP_DESKTOP_BREAKPOINT,
  buildAnchoredSheetStyle,
  isDesktopMapLayout,
  measureMemorySheetPlacement,
} from '../utils/mapMemoryAnchor';
import {
  getMapPopupScale,
} from '../utils/mapPopupScale';

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

function useDesktopMapLayout() {
  const [isDesktop, setIsDesktop] = useState(() => isDesktopMapLayout());

  useEffect(() => {
    const mediaQuery = window.matchMedia(MAP_DESKTOP_BREAKPOINT);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

export default function MemorySheet({
  pin,
  anchor = null,
  locationHref = null,
  onClose,
  embedded = false,
  responsiveScale = false,
  actions = null,
  hideToolbar = false,
  footerCta = null,
}) {
  const sheetRef = useRef(null);
  const [placement, setPlacement] = useState(null);
  const isDesktopMap = useDesktopMapLayout();
  const useAnchoredPopup = Boolean(anchor) && isDesktopMap && !embedded;
  const hasMedia = Boolean(pin?.mediaPreview?.url);
  const [orientation, setOrientation] = useState(() => resolvePolaroidOrientation(pin));
  const [mediaSheetScale, setMediaSheetScale] = useState(1);
  const { quoteRef, isLongQuote } = useLongQuote(
    pin?.quote,
    hasMedia ? `${embedded ? 'embedded' : mediaSheetScale}:${orientation}` : 'text-only',
  );

  useEffect(() => {
    const shouldScale = responsiveScale || (!embedded && hasMedia);
    if (!shouldScale) {
      setMediaSheetScale(1);
      return undefined;
    }

    function updateScale() {
      setMediaSheetScale(getMapPopupScale());
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [embedded, hasMedia, responsiveScale]);

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

  useLayoutEffect(() => {
    if (!useAnchoredPopup || !anchor || !sheetRef.current) {
      setPlacement(null);
      return;
    }

    setPlacement(measureMemorySheetPlacement(anchor, sheetRef.current));
  }, [anchor, useAnchoredPopup, pin, locationHref, hasMedia, orientation, isLongQuote]);

  if (!pin) return null;
  if (useAnchoredPopup && !anchor) return null;

  const canOpenMaps = Array.isArray(pin.ll) && pin.ll.length >= 2;
  const sheetTags = buildMemorySheetTags(pin);
  const usesResponsiveScale = responsiveScale || !embedded;

  function handleTakeMeThere(event) {
    event.stopPropagation();
    openGoogleMapsDirections(pin.ll[0], pin.ll[1], event);
  }

  const sheet = (
    <article
      ref={useAnchoredPopup ? sheetRef : undefined}
      className={[
        'memory-sheet',
        useAnchoredPopup ? 'memory-sheet--anchored' : 'memory-sheet--dock',
        hasMedia ? 'memory-sheet--with-media' : 'memory-sheet--text-only',
        useAnchoredPopup && placement?.below ? 'memory-sheet--below' : '',
      ].filter(Boolean).join(' ')}
      style={{
        ...(usesResponsiveScale && !useAnchoredPopup ? {
          '--memory-sheet-responsive-scale': mediaSheetScale,
        } : undefined),
        ...(useAnchoredPopup ? buildAnchoredSheetStyle(placement, anchor) : undefined),
      }}
      onClick={embedded ? undefined : (event => event.stopPropagation())}
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
            <section className="memory-sheet-media" aria-labelledby="memory-sheet-media-heading">
              <VisuallyHiddenTitle id="memory-sheet-media-heading" as="h3">Memo photo</VisuallyHiddenTitle>
              {!hideToolbar && (
                <div className={`memory-sheet-media-toolbar${actions ? ' memory-sheet-media-toolbar--created-actions' : ''}`}>
                  {actions ?? (
                    <MemoFavoriteButton
                      memoId={pin.id}
                      label={pin.location}
                    />
                  )}
                </div>
              )}
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
                          preload="metadata"
                        />
                      )
                      : (
                        <img
                          src={pin.mediaPreview.url}
                          alt={`Memo photo from ${pin.location}`}
                          className={buildMemoMediaClassName('memory-sheet-preview-img', orientation)}
                          decoding="async"
                          fetchPriority="high"
                        />
                      )}
                  </div>
                </div>
              </div>
              <MemoTags tags={sheetTags} />
            </section>
          ) : (
            <>
              {!hideToolbar && actions && (
                <div className="created-memo-card__toolbar created-memo-card__toolbar--text-only">
                  {actions}
                </div>
              )}
              <header className="memory-sheet-text-only-head">
                <MemoTags tags={sheetTags} className="memory-sheet-tags--inline" />
                {!hideToolbar && !actions && (
                  <MemoFavoriteButton
                    memoId={pin.id}
                    label={pin.location}
                  />
                )}
              </header>
            </>
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
            {footerCta ? (
              <button
                type="button"
                className={footerCta.className ?? 'memory-sheet-cta'}
                onClick={(event) => {
                  event.stopPropagation();
                  footerCta.onClick?.(event);
                }}
              >
                {footerCta.label}
              </button>
            ) : canOpenMaps && (
              <Link
                to={buildGoogleMapsDirectionsUrl(pin.ll[0], pin.ll[1])}
                target="_blank"
                rel="noopener noreferrer"
                reloadDocument
                className="memory-sheet-cta"
                onClick={handleTakeMeThere}
              >
                Take me there
              </Link>
            )}
          </footer>
        </div>
      </div>
    </article>
  );

  if (embedded) {
    return sheet;
  }

  if (useAnchoredPopup) {
    return (
      <div className="memory-sheet-backdrop memory-sheet-backdrop--anchored">
        {sheet}
      </div>
    );
  }

  return (
    <div className="memory-sheet-backdrop memory-sheet-backdrop--dock">
      {sheet}
    </div>
  );
}
