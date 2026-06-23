import { useCallback, useEffect, useRef } from 'react';
import { getGsapSync, preloadGsap } from '../../utils/gsapClient';
import { clampPercent, updateStickerPosition } from '../../utils/stickerTracker';
import { getStickerDef } from '../../utils/stickers';
import { useDiaryStickerCatalog } from '../../hooks/useDiaryStickerCatalog';
import StickerVisual from './StickerVisual';
import StickerCollectionFrame from '../stickers/StickerCollectionFrame';

function isInsideRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

const DISMISS_FADE_DISTANCE_PX = 48;

function getDismissOpacity(centerX, centerY, zoneRect, trayRect) {
  const inTray = trayRect && isInsideRect(centerX, centerY, trayRect);
  if (inTray) return 0;

  const pastBottom = centerY - zoneRect.bottom;
  if (pastBottom <= 0) return 1;

  return Math.max(0, 1 - pastBottom / DISMISS_FADE_DISTANCE_PX);
}

function shouldDismissSticker(centerX, centerY, zoneRect, trayRect, opacity) {
  if (opacity <= 0.2) return true;
  if (trayRect && isInsideRect(centerX, centerY, trayRect)) return true;
  return centerY > zoneRect.bottom;
}

export default function DraggableSticker({
  sticker,
  dropZoneRef,
  trayRef,
  pageIndex,
  diaryId,
  onMove,
  onReturnToTray,
  onDragStart,
  onDragEnd,
  collectionOutline = false,
  collectionFrameClassName = '',
  collectionFrameStyle,
  className = '',
}) {
  const elRef = useRef(null);
  const stickerCatalog = useDiaryStickerCatalog();
  const stickerRef = useRef(sticker);
  const onMoveRef = useRef(onMove);
  const onReturnToTrayRef = useRef(onReturnToTray);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  const dragRef = useRef(null);

  // Warm up dynamic GSAP import before the first drag interaction.
  useEffect(() => {
    preloadGsap();
  }, []);

  stickerRef.current = sticker;
  onMoveRef.current = onMove;
  onReturnToTrayRef.current = onReturnToTray;
  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;

  const clearSession = session => {
    if (!session) return;
    const el = elRef.current;
    if (el) {
      el.removeEventListener('pointermove', session.onMove);
      el.removeEventListener('pointerup', session.onEnd);
      el.removeEventListener('pointercancel', session.onEnd);
      if (session.pointerId != null) {
        try {
          el.releasePointerCapture(session.pointerId);
        } catch {
          /* ignore */
        }
      }
    }
    dragRef.current = null;
  };

  const attachRef = useCallback((node) => {
    if (!node) {
      const session = dragRef.current;
      if (session?.dragging) onDragEndRef.current?.();
      clearSession(session);
      return;
    }
    elRef.current = node;
  }, [sticker.uid]);

  const finishDrag = (clientX, clientY) => {
    const session = dragRef.current;
    if (!session || session.settled) return;
    session.settled = true;

    if (session.persistTimer) {
      clearTimeout(session.persistTimer);
      session.persistTimer = null;
    }

    const el = elRef.current;
    const dropZone = dropZoneRef.current;
    const wasDragging = session.dragging;
    clearSession(session);

    if (!wasDragging) {
      onDragEndRef.current?.();
      return;
    }

    if (!el || !dropZone) {
      onDragEndRef.current?.();
      return;
    }

    const gsap = getGsapSync();
    const zoneRect = dropZone.getBoundingClientRect();
    const tray = trayRef?.current;
    const trayRect = tray?.getBoundingClientRect() ?? null;
    const uid = stickerRef.current.uid;

    const elRect = el.getBoundingClientRect();
    const centerX = elRect.left + elRect.width / 2;
    const centerY = elRect.top + elRect.height / 2;
    const dismissOpacity = getDismissOpacity(centerX, centerY, zoneRect, trayRect);

    if (tray && shouldDismissSticker(centerX, centerY, zoneRect, trayRect, dismissOpacity)) {
      gsap.to(el, {
        scale: 0.5,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          onReturnToTrayRef.current(uid);
          gsap.set(el, { scale: 1, opacity: 1 });
          onDragEndRef.current?.();
        },
      });
      return;
    }

    gsap.set(el, { scale: 1, opacity: 1 });

    if (!isInsideRect(centerX, centerY, zoneRect)) {
      gsap.to(el, {
        scale: 0.5,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          onReturnToTrayRef.current(uid);
          gsap.set(el, { scale: 1, opacity: 1 });
          onDragEndRef.current?.();
        },
      });
      return;
    }

    const x = clampPercent(((centerX - zoneRect.left) / zoneRect.width) * 100);
    const y = clampPercent(((centerY - zoneRect.top) / zoneRect.height) * 100);
    onMoveRef.current(uid, x, y);
    gsap.set(el, { x: 0, y: 0, opacity: 1 });
    onDragEndRef.current?.();
  };

  const handlePointerDown = e => {
    if (dragRef.current) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();

    const el = elRef.current;
    const dropZone = dropZoneRef.current;
    if (!el || !dropZone) return;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const originX = stickerRef.current.x;
    const originY = stickerRef.current.y;
    const zoneRect = dropZone.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = ev => {
      if (ev.pointerId !== e.pointerId) return;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const session = dragRef.current;
      if (!session || session.settled) return;

      if (!session.dragging) {
        if (Math.hypot(dx, dy) < 6) return;
        session.dragging = true;
        onDragStartRef.current?.();
        getGsapSync().to(el, { scale: 1.12, duration: 0.15, ease: 'power2.out' });
        if (ev.cancelable) ev.preventDefault();
      }

      const centerX = zoneRect.left + (originX / 100) * zoneRect.width + dx;
      const centerY = zoneRect.top + (originY / 100) * zoneRect.height + dy;
      const x = ((centerX - zoneRect.left) / zoneRect.width) * 100;
      const y = ((centerY - zoneRect.top) / zoneRect.height) * 100;

      const tray = trayRef?.current;
      const trayRect = tray?.getBoundingClientRect() ?? null;
      const dismissOpacity = tray
        ? getDismissOpacity(centerX, centerY, zoneRect, trayRect)
        : 1;
      const visualX = tray ? x : clampPercent(x);
      const visualY = tray ? y : clampPercent(y);

      getGsapSync().set(el, {
        left: `${visualX}%`,
        top: `${visualY}%`,
        x: 0,
        y: 0,
        opacity: dismissOpacity,
      });

      if (diaryId != null && dismissOpacity > 0.5) {
        if (session.persistTimer) clearTimeout(session.persistTimer);
        session.persistTimer = setTimeout(() => {
          updateStickerPosition(
            diaryId,
            pageIndex,
            stickerRef.current.uid,
            clampPercent(x),
            clampPercent(y),
          );
        }, 120);
      } else if (session.persistTimer) {
        clearTimeout(session.persistTimer);
        session.persistTimer = null;
      }
    };

    const onEnd = ev => {
      if (ev.pointerId !== e.pointerId) return;
      finishDrag(ev.clientX, ev.clientY);
    };

    dragRef.current = {
      settled: false,
      dragging: false,
      pointerId: e.pointerId,
      onMove,
      onEnd,
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onEnd);
    el.addEventListener('pointercancel', onEnd);
  };

  const def = getStickerDef(sticker.stickerId, stickerCatalog);
  if (!def) return null;

  return (
    <div
      ref={attachRef}
      className={`diary-placed-sticker ${className}`.trim()}
      style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
      onPointerDown={handlePointerDown}
      data-sticker-id={sticker.stickerId}
      data-x={sticker.x}
      data-y={sticker.y}
    >
      {collectionOutline ? (
        <StickerCollectionFrame
          src={def.src}
          emoji={def.emoji}
          label={def.label}
          frameClassName={collectionFrameClassName}
          style={collectionFrameStyle}
        />
      ) : (
        <StickerVisual
          src={def.src}
          emoji={def.emoji}
          label={def.label}
        />
      )}
    </div>
  );
}
