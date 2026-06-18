import { useCallback, useEffect, useRef } from 'react';
import { getGsapSync, preloadGsap } from '../../utils/gsapClient';
import { clampPercent, updateStickerPosition } from '../../utils/stickerTracker';
import { getStickerDef } from '../../utils/stickers';
import { useDiaryStickerCatalog } from '../../hooks/useDiaryStickerCatalog';
import StickerVisual from './StickerVisual';

function isInsideRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
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

    gsap.set(el, { scale: 1 });

    const elRect = el.getBoundingClientRect();
    const centerX = elRect.left + elRect.width / 2;
    const centerY = elRect.top + elRect.height / 2;
    const uid = stickerRef.current.uid;

    const tray = trayRef?.current;
    if (tray && isInsideRect(centerX, centerY, tray.getBoundingClientRect())) {
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

    const zoneRect = dropZone.getBoundingClientRect();
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
    gsap.set(el, { x: 0, y: 0 });
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

      getGsapSync().set(el, {
        left: `${clampPercent(x)}%`,
        top: `${clampPercent(y)}%`,
        x: 0,
        y: 0,
      });

      if (diaryId != null) {
        if (session.persistTimer) clearTimeout(session.persistTimer);
        session.persistTimer = setTimeout(() => {
          updateStickerPosition(diaryId, pageIndex, stickerRef.current.uid, x, y);
        }, 120);
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
      className="diary-placed-sticker"
      style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
      onPointerDown={handlePointerDown}
      data-sticker-id={sticker.stickerId}
      data-x={sticker.x}
      data-y={sticker.y}
    >
      <StickerVisual
        src={def.src}
        emoji={def.emoji}
        label={def.label}
      />
    </div>
  );
}
