import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { pixelToPercent } from '../../utils/stickerTracker';
import StickerVisual, { createStickerCloneNode } from '../diary/StickerVisual';
import { useJournalStickerDock } from '../../hooks/useJournalStickerDock';

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

export default function JournalStickerDock({
  dropZoneRef,
  trayRef,
  pageIndex,
  onDropOnPage,
}) {
  const stickers = useJournalStickerDock();
  const onDropRef = useRef(onDropOnPage);
  onDropRef.current = onDropOnPage;

  const dragRef = useRef(null);
  const lastStartRef = useRef(0);

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
    gsap.set(clone, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 });

    const pointerId = e.pointerId;

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      gsap.set(clone, { x: ev.clientX, y: ev.clientY, xPercent: -50, yPercent: -50 });
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

  return (
    <div ref={attachTrayRef} className="journal-sticker-dock" aria-label="Sticker menu">
      <div className="journal-sticker-dock-handle" aria-hidden="true" />
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
