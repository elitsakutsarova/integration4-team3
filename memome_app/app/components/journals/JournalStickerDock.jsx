import { useCallback, useEffect, useRef, useState } from 'react';
import { getGsapSync, preloadGsap } from '../../utils/gsapClient';
import { pixelToPercent } from '../../utils/stickerTracker';
import StickerVisual, { createStickerCloneNode } from '../diary/StickerVisual';
import { useJournalStickerDock } from '../../hooks/useJournalStickerDock';

const DOCK_HEIGHT_KEY = 'journal-sticker-dock-height';
const MIN_DOCK_HEIGHT = 40;
const MAX_DOCK_HEIGHT_CAP = 360;

function getMaxDockHeight() {
  if (typeof window === 'undefined') return MAX_DOCK_HEIGHT_CAP;
  return Math.min(window.innerHeight * 0.55, MAX_DOCK_HEIGHT_CAP);
}

function getDefaultDockHeight() {
  if (typeof window === 'undefined') return 200;
  return Math.min(window.innerHeight * 0.42, MAX_DOCK_HEIGHT_CAP);
}

function clampDockHeight(height) {
  return Math.max(MIN_DOCK_HEIGHT, Math.min(getMaxDockHeight(), height));
}

function readStoredDockHeight() {
  if (typeof window === 'undefined') return getDefaultDockHeight();
  const stored = Number(localStorage.getItem(DOCK_HEIGHT_KEY));
  if (!Number.isFinite(stored) || stored <= 0) return getDefaultDockHeight();
  return clampDockHeight(stored);
}

function clearDragSession(dragRef) {
  const session = dragRef.current;
  if (!session) return;

  const { btn, onMove, onEnd, clone, pointerId } = session;
  if (btn) {
    btn.removeEventListener('pointermove', onMove);
    btn.removeEventListener('pointerup', onEnd);
    btn.removeEventListener('pointercancel', onEnd);
    if (pointerId != null) {
      try {
        btn.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }
  }
  clone?.remove();
  dragRef.current = null;
}

function clearResizeSession(resizeRef) {
  const session = resizeRef.current;
  if (!session) return;

  const { handle, onMove, onEnd, pointerId } = session;
  if (handle) {
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onEnd);
    handle.removeEventListener('pointercancel', onEnd);
    if (pointerId != null) {
      try {
        handle.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }
  }
  resizeRef.current = null;
}

export default function JournalStickerDock({
  dropZoneRef,
  trayRef,
  pageIndex,
  onDropOnPage,
}) {
  const stickers = useJournalStickerDock();
  const onDropRef = useRef(onDropOnPage);
  onDropRef.current = onDropOnPage;

  const [dockHeight, setDockHeight] = useState(readStoredDockHeight);
  const dockHeightRef = useRef(dockHeight);
  dockHeightRef.current = dockHeight;

  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const lastStartRef = useRef(0);

  // Warm up dynamic GSAP import before the first drag interaction.
  useEffect(() => {
    preloadGsap();
  }, []);

  // Re-clamp dock height when the viewport is resized.
  useEffect(() => {
    const onResize = () => {
      setDockHeight((height) => clampDockHeight(height));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Tear down an in-progress dock resize if the component unmounts.
  useEffect(() => () => clearResizeSession(resizeRef), []);

  const attachTrayRef = useCallback((node) => {
    if (trayRef) trayRef.current = node;
    if (!node) clearDragSession(dragRef);
  }, [trayRef]);

  const endDrag = useCallback((clientX, clientY) => {
    const session = dragRef.current;
    if (!session || session.settled) return;
    session.settled = true;

    const { clone, originDropZone } = session;
    clearDragSession(dragRef);

    if (!clone || !originDropZone) {
      clone?.remove();
      return;
    }

    const zoneRect = originDropZone.getBoundingClientRect();
    const onPage =
      clientX >= zoneRect.left
      && clientX <= zoneRect.right
      && clientY >= zoneRect.top
      && clientY <= zoneRect.bottom;

    const gsap = getGsapSync();

    if (onPage) {
      const { x, y } = pixelToPercent(clientX, clientY, zoneRect);
      onDropRef.current(session.stickerDef, x, y, session.originPageIndex);
      gsap.fromTo(
        clone,
        { scale: 1.2 },
        {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => clone.remove(),
        },
      );
    } else {
      gsap.to(clone, {
        scale: 0.5,
        opacity: 0,
        duration: 0.15,
        onComplete: () => clone.remove(),
      });
    }
  }, []);

  const startDrag = useCallback((stickerDef, e) => {
    const now = Date.now();
    if (now - lastStartRef.current < 350) return;
    lastStartRef.current = now;

    if (dragRef.current) clearDragSession(dragRef);
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();

    const btn = e.currentTarget;
    try {
      btn.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const clone = createStickerCloneNode(stickerDef);
    document.body.appendChild(clone);
    const gsap = getGsapSync();
    gsap.set(clone, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 });

    const pointerId = e.pointerId;

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      getGsapSync().set(clone, { x: ev.clientX, y: ev.clientY, xPercent: -50, yPercent: -50 });
    };

    const onEnd = (ev) => {
      if (ev.pointerId !== pointerId) return;
      endDrag(ev.clientX, ev.clientY);
    };

    dragRef.current = {
      stickerDef,
      clone,
      btn,
      pointerId,
      settled: false,
      onMove,
      onEnd,
      originPageIndex: pageIndex,
      originDropZone: dropZoneRef.current,
    };

    btn.addEventListener('pointermove', onMove, { passive: false });
    btn.addEventListener('pointerup', onEnd);
    btn.addEventListener('pointercancel', onEnd);
  }, [endDrag, pageIndex, dropZoneRef]);

  const startResize = useCallback((e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();

    if (resizeRef.current) clearResizeSession(resizeRef);

    const handle = e.currentTarget;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startHeight = dockHeightRef.current;

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      const delta = startY - ev.clientY;
      setDockHeight(clampDockHeight(startHeight + delta));
    };

    const onEnd = (ev) => {
      if (ev.pointerId !== pointerId) return;
      clearResizeSession(resizeRef);
      localStorage.setItem(DOCK_HEIGHT_KEY, String(dockHeightRef.current));
    };

    resizeRef.current = { handle, pointerId, onMove, onEnd };
    handle.addEventListener('pointermove', onMove, { passive: false });
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
  }, []);

  const isCollapsed = dockHeight <= MIN_DOCK_HEIGHT + 8;

  return (
    <div
      ref={attachTrayRef}
      className={`journal-sticker-dock${isCollapsed ? ' journal-sticker-dock--collapsed' : ''}`}
      style={{ height: `${dockHeight}px` }}
      aria-label="Sticker menu"
    >
      <div
        className="journal-sticker-dock-handle"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Drag up or down to resize sticker menu"
        aria-valuemin={MIN_DOCK_HEIGHT}
        aria-valuemax={getMaxDockHeight()}
        aria-valuenow={dockHeight}
        onPointerDown={startResize}
      />
      <div className="journal-sticker-dock-grid">
        {stickers.length === 0 ? (
          <p className="journal-sticker-dock-empty">No stickers available yet</p>
        ) : (
          stickers.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              className="journal-sticker-dock-btn"
              data-sticker-source
              data-sticker-id={sticker.id}
              aria-label={sticker.label}
              onPointerDown={(ev) => startDrag(sticker, ev)}
            >
              <StickerVisual src={sticker.src} emoji={sticker.emoji} label={sticker.label} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
