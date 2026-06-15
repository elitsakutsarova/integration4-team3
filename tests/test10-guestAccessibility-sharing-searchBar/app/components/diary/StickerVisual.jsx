/** Render a sticker as PNG image or emoji fallback */
export default function StickerVisual({ src, emoji, label, className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={label ?? 'Sticker'}
        className={`sticker-img ${className}`.trim()}
        draggable={false}
      />
    );
  }
  if (emoji) {
    return <span className={className}>{emoji}</span>;
  }
  return null;
}

/** Build a DOM clone node for GSAP drag-from-tray */
export function createStickerCloneNode(stickerDef) {
  const clone = document.createElement('div');
  clone.className = 'diary-sticker-drag-clone';
  clone.style.position = 'fixed';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.zIndex = '20000';
  clone.style.pointerEvents = 'none';

  if (stickerDef.src) {
    const img = document.createElement('img');
    img.src = stickerDef.src;
    img.alt = stickerDef.label ?? '';
    img.className = 'diary-sticker-drag-clone-img';
    img.draggable = false;
    clone.appendChild(img);
  } else {
    clone.textContent = stickerDef.emoji ?? '';
  }

  return clone;
}
