// handles the "Create a Recap" flow 

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import CreateJournalDecorations from '../journals/CreateJournalDecorations';
import JournalMemoPickCard from '../journals/JournalMemoPickCard';
import RecapShareSheet from './RecapShareSheet';
import RecapShareSuccess from './RecapShareSuccess';
import { MEMO_TAG_OPTIONS } from '../../data/memoTags';
import {
  RECAP_MAX_MEMOS,
  RECAP_STYLES,
  orderSelectedMemories,
} from '../../utils/recapTemplates';
import {
  downloadRecapImageFile,
  renderStyledRecapImage,
  shareImageFiles,
  shareToInstagram,
} from '../../utils/shareImage';
import { paths } from '../../utils/appPaths';

// when the user scrolls the style carousel, this finds the style card closest to the center of the screen
// returns its index
function getClosestStyleIndex(container, slideElements) {
  const containerCenter = container.scrollLeft + container.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;

  slideElements.forEach((slide, index) => {
    if (!slide) return;
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(containerCenter - slideCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

// when the user clicks on a dot underneath the carousel, it scrolls to the selected style
function scrollStyleIntoView(container, slide) {
  if (!container || !slide) return;
  const targetLeft = slide.offsetLeft - (container.clientWidth - slide.offsetWidth) / 2;
  container.scrollTo({ left: targetLeft, behavior: 'smooth' });
}

// adds drag support to the style carousel of the recap
function useRecapCarouselDrag(carouselRef) {
  // Attach pointer listeners for mouse-drag scrolling on the style carousel.
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    function onPointerDown(event) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      isDragging = true;
      startX = event.clientX;
      scrollLeft = carousel.scrollLeft;
      carousel.setPointerCapture(event.pointerId);
      carousel.classList.add('recap-style-carousel--dragging');
    }

    function onPointerMove(event) {
      if (!isDragging) return;
      event.preventDefault();
      const delta = event.clientX - startX;
      carousel.scrollLeft = scrollLeft - delta;
    }

    function endDrag(event) {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove('recap-style-carousel--dragging');
      if (carousel.hasPointerCapture(event.pointerId)) {
        carousel.releasePointerCapture(event.pointerId);
      }
    }

    carousel.addEventListener('pointerdown', onPointerDown);
    carousel.addEventListener('pointermove', onPointerMove);
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);

    return () => {
      carousel.removeEventListener('pointerdown', onPointerDown);
      carousel.removeEventListener('pointermove', onPointerMove);
      carousel.removeEventListener('pointerup', endDrag);
      carousel.removeEventListener('pointercancel', endDrag);
    };
  }, [carouselRef]);
}

// !important
// For every recap style, generates a preview image
function useRecapPreviewFiles(journal, selectedMemories) {
  const [previewFiles, setPreviewFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const selectedKey = selectedMemories.map((memo) => memo.id).join(',');

  // Generate recap preview images async; revoke blob URLs on cleanup or regen.
  useEffect(() => {
    let cancelled = false;
    const createdUrls = [];

    async function generate() {
      setLoading(true);
      const files = {};
      const urls = {};

      for (const style of RECAP_STYLES) {
        const file = await renderStyledRecapImage(journal, selectedMemories, style.id);
        if (cancelled) return;
        files[style.id] = file;
        const url = URL.createObjectURL(file);
        createdUrls.push(url);
        urls[style.id] = url;
      }

      if (!cancelled) {
        setPreviewFiles(files);
        setPreviewUrls(urls);
        setLoading(false);
      }
    }

    if (selectedMemories.length) {
      generate();
    } else {
      setPreviewFiles({});
      setPreviewUrls({});
      setLoading(false);
    }

    return () => {
      cancelled = true;
      createdUrls.forEach(URL.revokeObjectURL);
    };
  }, [journal.id, journal.title, selectedKey]);

  return { previewFiles, previewUrls, loading };
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...MEMO_TAG_OPTIONS.map((tag) => ({ id: tag, label: tag })),
  { id: 'Hidden gems', label: 'Hidden gems' },
];

function filterMemos(memos, filterId) {
  if (filterId === 'all') return memos;
  return memos.filter((memo) => (memo.tags ?? []).includes(filterId));
}

// reusable layout for recap flow pages
function RecapFlowShell({ title, onBack, children, footer, headerExtra = null }) {
  return (
    <div className="recap-flow-page">
      <button type="button" className="create-journal-back" onClick={onBack} aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {headerExtra}
      <CreateJournalDecorations title={title} />
      {children}
      {footer}
    </div>
  );
}

// first screen, stores selected memos
export default function RecapSelectView({
  memories,
  onBack,
  onContinue,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [filterId, setFilterId] = useState('all');

  const filteredMemos = useMemo(
    () => filterMemos(memories, filterId),
    [memories, filterId],
  );
  const selectedCount = selected.size;

  function toggleMemo(memoId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(memoId)) {
        next.delete(memoId);
        return next;
      }
      if (next.size >= RECAP_MAX_MEMOS) return prev;
      next.add(memoId);
      return next;
    });
  }

  const footerLabel = selectedCount === 0
    ? 'Select memos'
    : `Select ${selectedCount} memo${selectedCount === 1 ? '' : 's'}`;

  return (
    <RecapFlowShell
      title="Select memos"
      onBack={onBack}
      headerExtra={(
        <div className="create-journal-pick-count" aria-live="polite">
          <span className="create-journal-pick-count-dot" aria-hidden="true" />
          <span className="create-journal-pick-count-value">
            {selectedCount}
            /
            {RECAP_MAX_MEMOS}
          </span>
        </div>
      )}
      footer={(
        <div className="recap-flow-footer">
          <button
            type="button"
            className={`recap-flow-submit${selectedCount ? ' recap-flow-submit--active' : ''}`}
            disabled={!selectedCount}
            onClick={() => onContinue([...selected])}
          >
            <span>{footerLabel}</span>
            {selectedCount > 0 && <small>out of {RECAP_MAX_MEMOS}</small>}
          </button>
        </div>
      )}
    >
      <div className="create-journal-filter-bar" role="toolbar" aria-label="Filter memos">
        <div className="create-journal-filter-track">
          {FILTER_OPTIONS.map((option) => {
            const active = option.id === filterId;
            return (
              <button
                key={option.id}
                type="button"
                className={`create-journal-filter-chip${active ? ' create-journal-filter-chip--active' : ''}`}
                aria-pressed={active}
                onClick={() => setFilterId(option.id)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="create-journal-pick-list recap-flow-pick-list">
        {filteredMemos.length === 0 ? (
          <p className="create-journal-pick-empty">No memos match this filter yet.</p>
        ) : (
          filteredMemos.map((memo) => (
            <JournalMemoPickCard
              key={memo.id}
              memo={memo}
              selected={selected.has(memo.id)}
              onToggle={() => toggleMemo(memo.id)}
            />
          ))
        )}
      </div>
    </RecapFlowShell>
  );
}

// user already chose memos, now they choose a recap style (out of 3)
export function RecapChooseStyleView({
  journal,
  memories,
  selectedIds,
  onBack,
  onShared,
}) {
  const navigate = useNavigate();
  const [styleId, setStyleId] = useState(RECAP_STYLES[0].id);
  const [showSheet, setShowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sharing, setSharing] = useState(false);
  const carouselRef = useRef(null);
  const slideRefs = useRef([]);

  const selectedMemories = useMemo(
    () => orderSelectedMemories(memories, selectedIds),
    [memories, selectedIds],
  );

  // generates preview images for each style
  const { previewFiles, previewUrls, loading: previewsLoading } = useRecapPreviewFiles(
    journal,
    selectedMemories,
  );

  const activeStyleIndex = RECAP_STYLES.findIndex((style) => style.id === styleId);

  useRecapCarouselDrag(carouselRef);

  const handleCarouselScroll = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const closestIndex = getClosestStyleIndex(carousel, slideRefs.current);
    const nextStyleId = RECAP_STYLES[closestIndex]?.id;
    if (nextStyleId && nextStyleId !== styleId) {
      setStyleId(nextStyleId);
    }
  }, [styleId]);

  const selectStyle = useCallback((index) => {
    const style = RECAP_STYLES[index];
    if (!style) return;
    setStyleId(style.id);
    scrollStyleIntoView(carouselRef.current, slideRefs.current[index]);
  }, []);

  async function buildRecapFile() {
    return previewFiles[styleId] ?? renderStyledRecapImage(journal, selectedMemories, styleId);
  }

  async function handleDownload() {
    try {
      const file = await buildRecapFile();
      await downloadRecapImageFile(file);
      onShared?.('Recap downloaded!');
    } catch {
      onShared?.('Download failed — please try again.');
    }
  }

  // handles sharing the recap image to the user's chosen app
  async function handleShareApp(appId) {
    if (sharing) return;
    setSharing(true);
    try {
      const file = await buildRecapFile();

      if (appId === 'download') {
        await downloadRecapImageFile(file);
        setShowSheet(false);
        return;
      }

      let shared = false;
      if (appId === 'instagram') {
        const message = await shareToInstagram([file], {
          title: `${journal.title} — Trip Recap`,
          text: `My ${journal.title} recap!`,
        });
        shared = Boolean(message);
      } else {
        const result = await shareImageFiles([file], {
          title: `${journal.title} — Trip Recap`,
          text: `My ${journal.title} recap!`,
        });
        shared = result.method !== 'cancelled';
      }

      setShowSheet(false);
      if (shared) {
        // on success (of sharing)
        setShowSuccess(true);
      }
    } catch (err) {
      console.error(err);
      onShared?.('Could not share — try downloading the image instead.');
    } finally {
      setSharing(false);
    }
  }

  async function handleShareContact() {
    await handleShareApp('messages');
  }

  return (
    <RecapFlowShell
      title="Choose recap"
      onBack={onBack}
      headerExtra={(
        <button
          type="button"
          className="recap-flow-download"
          aria-label="Download recap"
          onClick={handleDownload}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      )}
      footer={(
        <div className="recap-flow-footer">
          <button
            type="button"
            className="recap-flow-submit recap-flow-submit--active"
            onClick={() => setShowSheet(true)}
          >
            <span>Share recap</span>
          </button>
        </div>
      )}
    >
      <div className="recap-style-picker">
        <div
          ref={carouselRef}
          className="recap-style-carousel"
          role="listbox"
          aria-label="Recap styles"
          onScroll={handleCarouselScroll}
        >
          {RECAP_STYLES.map((style, index) => {
            const active = style.id === styleId;
            const previewUrl = previewUrls[style.id];
            return (
              <div
                key={style.id}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
                role="option"
                aria-selected={active}
                className={`recap-style-slide${active ? ' recap-style-slide--active' : ''}`}
              >
                {previewsLoading || !previewUrl ? (
                  <div className="recap-style-preview recap-style-preview--loading" aria-hidden="true">
                    Generating preview…
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt={`${style.label} recap`}
                    className="recap-style-preview"
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="recap-style-steps" role="tablist" aria-label="Recap style steps">
          {RECAP_STYLES.map((style, index) => {
            const active = index === activeStyleIndex;
            return (
              <button
                key={style.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={style.label}
                className={`recap-style-step${active ? ' recap-style-step--active' : ''}`}
                onClick={() => selectStyle(index)}
              />
            );
          })}
        </div>
      </div>

      {showSheet && (
        <RecapShareSheet
          journalTitle={journal.title}
          onClose={() => setShowSheet(false)}
          onShareApp={handleShareApp}
          onShareContact={handleShareContact}
          disabled={sharing}
        />
      )}

      {showSuccess && (
        <RecapShareSuccess
          onClose={() => {
            setShowSuccess(false);
            navigate(paths.journals);
          }}
        />
      )}
    </RecapFlowShell>
  );
}

