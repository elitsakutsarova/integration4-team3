import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { createSticker, pixelToPercent } from '../../utils/stickerTracker';

gsap.registerPlugin(Draggable);

export default function DiaryStickerTray({ stickers, dropZoneRef, trayRef, pageIndex, onDropOnPage }) {
  const rowRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    const dropZone = dropZoneRef.current;
    if (!row || !dropZone) return;

    const instances = [];

    const buttons = row.querySelectorAll('[data-sticker-source]');
    buttons.forEach(btn => {
      const stickerId = btn.dataset.stickerId;
      const stickerDef = stickers.find(s => s.id === stickerId);
      if (!stickerDef) return;

      const d = Draggable.create(btn, {
        type: 'x,y',
        onDrag() {
          gsap.set(btn, { x: 0, y: 0 });
        },
        onPress(e) {
          e.stopPropagation();
          const clone = document.createElement('div');
          clone.className = 'diary-sticker-drag-clone';
          clone.textContent = stickerDef.emoji;
          clone.style.position = 'fixed';
          clone.style.left = '0';
          clone.style.top = '0';
          clone.style.zIndex = '20000';
          clone.style.pointerEvents = 'none';
          document.body.appendChild(clone);
          btn._clone = clone;

          const moveClone = ev => {
            gsap.set(clone, { x: ev.clientX, y: ev.clientY, xPercent: -50, yPercent: -50 });
          };
          moveClone(e);
          btn._moveClone = moveClone;
          window.addEventListener('pointermove', moveClone);
        },
        onDrag(e) {
          if (btn._clone) {
            gsap.set(btn._clone, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 });
          }
        },
        onDragEnd(e) {
          window.removeEventListener('pointermove', btn._moveClone);
          const clone = btn._clone;
          btn._clone = null;

          const zoneRect = dropZone.getBoundingClientRect();
          const cx = e.clientX;
          const cy = e.clientY;

          const onPage =
            cx >= zoneRect.left &&
            cx <= zoneRect.right &&
            cy >= zoneRect.top &&
            cy <= zoneRect.bottom;

          if (onPage && clone) {
            const { x, y } = pixelToPercent(cx, cy, zoneRect);
            onDropOnPage(stickerDef, x, y);
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
          } else if (clone) {
            gsap.to(clone, {
              scale: 0.5,
              opacity: 0,
              duration: 0.15,
              onComplete: () => clone.remove(),
            });
          }

          gsap.set(btn, { x: 0, y: 0 });
        },
      });
      instances.push(d);
    });

    return () => {
      instances.forEach(d => d[0]?.kill());
      buttons.forEach(btn => {
        if (btn._clone) btn._clone.remove();
        window.removeEventListener('pointermove', btn._moveClone);
      });
    };
  }, [stickers, dropZoneRef, pageIndex, onDropOnPage]);

  return (
    <div ref={trayRef} className="diary-sticker-tray">
      <p className="diary-sticker-label">Stickers — drag onto page · drag back here to remove</p>
      <div ref={rowRef} className="diary-sticker-row">
        {stickers.map(sticker => (
          <button
            key={sticker.id}
            type="button"
            className="diary-sticker-btn"
            data-sticker-source
            data-sticker-id={sticker.id}
            aria-label={sticker.label}
          >
            {sticker.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}