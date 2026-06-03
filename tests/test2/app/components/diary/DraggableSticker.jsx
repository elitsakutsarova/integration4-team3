import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { clampPercent } from '../../utils/stickerTracker';

gsap.registerPlugin(Draggable);

export default function DraggableSticker({
  sticker,
  dropZoneRef,
  trayRef,
  pageIndex,
  onMove,
  onReturnToTray,
  onDragStart,
  onDragEnd,
}) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    const dropZone = dropZoneRef.current;
    if (!el || !dropZone) return;

    const draggable = Draggable.create(el, {
      type: 'x,y',
      bounds: dropZone,
      inertia: false,
      cursor: 'grab',
      activeCursor: 'grabbing',
      xPercent: -50,
      yPercent: -50,
      onPress() {
        onDragStart?.();
        gsap.to(el, { scale: 1.12, duration: 0.15, ease: 'power2.out' });
      },
      onDragEnd() {
        const tray = trayRef?.current;
        const elRect = el.getBoundingClientRect();
        const centerX = elRect.left + elRect.width / 2;
        const centerY = elRect.top + elRect.height / 2;

        if (tray) {
          const trayRect = tray.getBoundingClientRect();
          if (
            centerX >= trayRect.left &&
            centerX <= trayRect.right &&
            centerY >= trayRect.top &&
            centerY <= trayRect.bottom
          ) {
            gsap.to(el, {
              scale: 0.6,
              opacity: 0,
              duration: 0.2,
              ease: 'power2.in',
              onComplete: () => onReturnToTray(sticker.uid),
            });
            onDragEnd?.();
            return;
          }
        }

        const zoneRect = dropZone.getBoundingClientRect();
        const x = clampPercent(((centerX - zoneRect.left) / zoneRect.width) * 100);
        const y = clampPercent(((centerY - zoneRect.top) / zoneRect.height) * 100);

        gsap.to(el, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.25,
          ease: 'power2.out',
        });

        onMove(sticker.uid, x, y);
        onDragEnd?.();
      },
      onRelease() {
        gsap.to(el, { scale: 1, duration: 0.15 });
      },
    });

    return () => draggable[0]?.kill();
  }, [sticker.uid, sticker.x, sticker.y, pageIndex, dropZoneRef, trayRef, onMove, onReturnToTray, onDragStart, onDragEnd]);

  return (
    <div
      ref={elRef}
      className="diary-placed-sticker"
      style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
      data-sticker-id={sticker.stickerId}
      data-x={sticker.x}
      data-y={sticker.y}
    >
      {sticker.emoji}
    </div>
  );
}
