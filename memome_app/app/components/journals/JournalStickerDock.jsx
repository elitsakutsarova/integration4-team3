import { useCallback, useEffect, useRef, useState } from 'react';
import { getGsapSync, preloadGsap } from '../../utils/gsapClient';
import { pixelToPercent } from '../../utils/stickerTracker';
import { createStickerCloneNode } from '../diary/StickerVisual';
import StickerCollectionFrame from '../stickers/StickerCollectionFrame';
import { isQrCollectedJournalSticker } from '../../data/defaultJournalStickers';
import { useJournalStickerDock } from '../../hooks/useJournalStickerDock';

const DEFAULT_DOCK_HEIGHT_REM = 9;
const DEFAULT_DOCK_HEIGHT_PX = DEFAULT_DOCK_HEIGHT_REM * 16;
const MIN_DOCK_HEIGHT = 40;
const MAX_DOCK_HEIGHT_CAP = 360;
const DRAG_MOVE_THRESHOLD_PX = 8;
const DRAG_LONG_PRESS_MS = 180;
const DOCK_DRAG_EXIT_INSET_PX = 8;
const DRAG_COOLDOWN_MS = 100;
const DOCK_COLLAPSE_HOLD_MS = 2000;
const DOCK_COLLAPSE_ANIMATION_MS = 220;
const DRAG_BODY_CLASS = 'journal-sticker-drag-active';

function getMaxDockHeight() {
  if (typeof window === 'undefined') return MAX_DOCK_HEIGHT_CAP;
  return Math.min(window.innerHeight * 0.55, MAX_DOCK_HEIGHT_CAP);
}

function getDefaultDockHeight() {
  return clampDockHeight(DEFAULT_DOCK_HEIGHT_PX);
}

function clampDockHeight(height) {
  return Math.max(MIN_DOCK_HEIGHT, Math.min(getMaxDockHeight(), height));
}

function applyDockHeight(node, heightPx) {
  node.style.height = `${heightPx}px`;
  node.classList.toggle('journal-sticker-dock--collapsed', heightPx <= MIN_DOCK_HEIGHT + 8);
}

function readInitialDockHeight() {
  return getDefaultDockHeight();
}

function clearDragSession(dragRef) {
  const session = dragRef.current;
  if (!session) return;

  const { captureTarget, onMove, onEnd, clone, pointerId } = session;
  document.removeEventListener('pointermove', onMove);
  document.removeEventListener('pointerup', onEnd);
  document.removeEventListener('pointercancel', onEnd);
  if (captureTarget && pointerId != null) {
    try {
      captureTarget.releasePointerCapture(pointerId);
    } catch {
      /* ignore */
    }
  }
  clone?.remove();
  document.body.classList.remove(DRAG_BODY_CLASS);
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

  const [dockHeight, setDockHeight] = useState(readInitialDockHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isStickerDragging, setIsStickerDragging] = useState(false);
  const dockHeightRef = useRef(dockHeight);
  dockHeightRef.current = dockHeight;
  const preDragDockHeightRef = useRef(null);
  const stickerDockCollapseTimerRef = useRef(null);
  const stickerDragRestoreTimerRef = useRef(null);

  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const dockRef = useRef(null);
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
  useEffect(() => () => {
    clearResizeSession(resizeRef);
    setIsResizing(false);
    if (stickerDragRestoreTimerRef.current) {
      window.clearTimeout(stickerDragRestoreTimerRef.current);
    }
    if (stickerDockCollapseTimerRef.current) {
      window.clearTimeout(stickerDockCollapseTimerRef.current);
    }
  }, []);

  const cancelScheduledDockCollapse = useCallback(() => {
    if (!stickerDockCollapseTimerRef.current) return;
    window.clearTimeout(stickerDockCollapseTimerRef.current);
    stickerDockCollapseTimerRef.current = null;
  }, []);

  const collapseDockForStickerDrag = useCallback(() => {
    if (preDragDockHeightRef.current != null) return;

    preDragDockHeightRef.current = dockHeightRef.current;
    dockHeightRef.current = MIN_DOCK_HEIGHT;
    setIsStickerDragging(true);
    setDockHeight(MIN_DOCK_HEIGHT);

    const dock = dockRef.current;
    if (dock) applyDockHeight(dock, MIN_DOCK_HEIGHT);
  }, []);

  const scheduleDockCollapseForStickerDrag = useCallback(() => {
    cancelScheduledDockCollapse();
    stickerDockCollapseTimerRef.current = window.setTimeout(() => {
      stickerDockCollapseTimerRef.current = null;
      if (!dragRef.current) return;
      collapseDockForStickerDrag();
    }, DOCK_COLLAPSE_HOLD_MS);
  }, [cancelScheduledDockCollapse, collapseDockForStickerDrag]);

  const restoreDockAfterStickerDrag = useCallback(() => {
    cancelScheduledDockCollapse();

    const restoreHeight = preDragDockHeightRef.current;
    preDragDockHeightRef.current = null;

    if (restoreHeight == null) {
      setIsStickerDragging(false);
      return;
    }

    dockHeightRef.current = restoreHeight;
    setDockHeight(restoreHeight);

    const dock = dockRef.current;
    if (dock) applyDockHeight(dock, restoreHeight);

    if (stickerDragRestoreTimerRef.current) {
      window.clearTimeout(stickerDragRestoreTimerRef.current);
    }
    stickerDragRestoreTimerRef.current = window.setTimeout(() => {
      setIsStickerDragging(false);
      stickerDragRestoreTimerRef.current = null;
    }, DOCK_COLLAPSE_ANIMATION_MS);
  }, [cancelScheduledDockCollapse]);

  const attachTrayRef = useCallback((node) => {
    dockRef.current = node;
    if (trayRef) trayRef.current = node;
    if (!node) clearDragSession(dragRef);
  }, [trayRef]);

  const endDrag = useCallback((clientX, clientY) => {
    const session = dragRef.current;
    if (!session || session.settled) return;
    session.settled = true;

    const { clone, originDropZone } = session;
    clearDragSession(dragRef);
    restoreDockAfterStickerDrag();

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
  }, [restoreDockAfterStickerDrag]);

  const startDrag = useCallback((stickerDef, e) => {
    const now = Date.now();
    if (now - lastStartRef.current < DRAG_COOLDOWN_MS) return;

    if (dragRef.current) clearDragSession(dragRef);
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.pointerType === 'mouse') e.stopPropagation();

    const btn = e.currentTarget;
    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    const originDropZone = dropZoneRef.current;
    const useLongPress = e.pointerType === 'touch' || e.pointerType === 'pen';
    let longPressTimer = null;
    let started = false;

    const clearPendingInteraction = (cancelCollapse = false) => {
      if (cancelCollapse) cancelScheduledDockCollapse();
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      document.removeEventListener('pointermove', onPendingMove);
      document.removeEventListener('pointerup', onPendingEnd);
      document.removeEventListener('pointercancel', onPendingEnd);
    };

    const beginDrag = (ev) => {
      if (started) return;
      started = true;
      lastStartRef.current = Date.now();
      clearPendingInteraction(false);
      scheduleDockCollapseForStickerDrag();
      if (ev?.cancelable) ev.preventDefault();

      try {
        btn.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }

      const cloneClassName = [
        'diary-sticker-drag-clone',
        'journal-sticker-drag-clone',
        isQrCollectedJournalSticker(stickerDef.id) ? 'journal-sticker-drag-clone--qr-collected' : '',
      ].filter(Boolean).join(' ');

      const clone = createStickerCloneNode(stickerDef, {
        cloneClassName,
        imgClassName: 'journal-sticker-drag-clone-img',
      });
      document.body.appendChild(clone);
      document.body.classList.add(DRAG_BODY_CLASS);
      const gsap = getGsapSync();
      gsap.set(clone, {
        x: ev.clientX,
        y: ev.clientY,
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
      });

      const onMove = (moveEv) => {
        if (moveEv.pointerId !== pointerId) return;
        if (moveEv.cancelable) moveEv.preventDefault();
        getGsapSync().set(clone, {
          x: moveEv.clientX,
          y: moveEv.clientY,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
        });
      };

      const onEnd = (endEv) => {
        if (endEv.pointerId !== pointerId) return;
        endDrag(endEv.clientX, endEv.clientY);
      };

      dragRef.current = {
        stickerDef,
        clone,
        captureTarget: btn,
        pointerId,
        settled: false,
        onMove,
        onEnd,
        originPageIndex: pageIndex,
        originDropZone,
      };

      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onEnd);
      document.addEventListener('pointercancel', onEnd);
    };

    const onPendingMove = (ev) => {
      if (ev.pointerId !== pointerId || started) return;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const dockRect = dockRef.current?.getBoundingClientRect();

      if (useLongPress) {
        // Lift the sticker out through the top of the menu — start dragging immediately.
        if (dockRect && ev.clientY < dockRect.top + DOCK_DRAG_EXIT_INSET_PX) {
          beginDrag(ev);
          return;
        }

        if (adx < DRAG_MOVE_THRESHOLD_PX && ady < DRAG_MOVE_THRESHOLD_PX) return;

        // Still inside the menu — keep scrolling, cancel pick-up.
        if (
          dockRect
          && ev.clientX >= dockRect.left
          && ev.clientX <= dockRect.right
          && ev.clientY >= dockRect.top
          && ev.clientY <= dockRect.bottom
        ) {
          clearPendingInteraction(true);
        }
        return;
      }

      if (adx < DRAG_MOVE_THRESHOLD_PX && ady < DRAG_MOVE_THRESHOLD_PX) return;
      beginDrag(ev);
    };

    const onPendingEnd = (ev) => {
      if (ev.pointerId !== pointerId) return;
      clearPendingInteraction(true);
    };

    if (useLongPress) {
      longPressTimer = setTimeout(() => beginDrag(e), DRAG_LONG_PRESS_MS);
    }

    document.addEventListener('pointermove', onPendingMove, { passive: true });
    document.addEventListener('pointerup', onPendingEnd);
    document.addEventListener('pointercancel', onPendingEnd);
  }, [cancelScheduledDockCollapse, endDrag, pageIndex, dropZoneRef, scheduleDockCollapseForStickerDrag]);

  const startResize = useCallback((e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();

    if (resizeRef.current) clearResizeSession(resizeRef);

    const dock = dockRef.current;
    const handle = e.currentTarget;
    setIsResizing(true);

    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startHeight = dockHeightRef.current;

    if (dock) {
      applyDockHeight(dock, startHeight);
    }

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (ev.cancelable) ev.preventDefault();
      const delta = startY - ev.clientY;
      const height = clampDockHeight(startHeight + delta);
      dockHeightRef.current = height;
      if (dock) applyDockHeight(dock, height);
    };

    const onEnd = (ev) => {
      if (ev.pointerId !== pointerId) return;
      clearResizeSession(resizeRef);
      setDockHeight(dockHeightRef.current);
      setIsResizing(false);
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
      className={`journal-sticker-dock${isCollapsed ? ' journal-sticker-dock--collapsed' : ''}${isResizing ? ' journal-sticker-dock--resizing' : ''}${isStickerDragging ? ' journal-sticker-dock--sticker-dragging' : ''}`}
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
          stickers.map((sticker) => {
            const isQrCollected = isQrCollectedJournalSticker(sticker.id);

            return (
              <button
                key={sticker.id}
                type="button"
                className={`journal-sticker-dock-btn${isQrCollected ? ' journal-sticker-dock-btn--qr-collected' : ''}`}
                data-sticker-source
                data-sticker-id={sticker.id}
                aria-label={sticker.label}
                onPointerDown={(ev) => startDrag(sticker, ev)}
              >
                <StickerCollectionFrame
                  src={sticker.src}
                  emoji={sticker.emoji}
                  label={sticker.label}
                  frameClassName="journal-sticker-dock-frame"
                  style={{
                    '--sticker-collection-size': isQrCollected
                      ? 'var(--journal-sticker-menu-size-qr)'
                      : 'var(--journal-sticker-menu-size)',
                  }}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
