import StickerVisual from '../diary/StickerVisual';

export default function StickerCollectionFrame({
  src,
  emoji,
  label,
  className = '',
  frameClassName = '',
  style,
}) {
  const frameClasses = ['stickers-collection-frame', frameClassName].filter(Boolean).join(' ');

  if (!src) {
    return (
      <div className={frameClasses} style={style}>
        <StickerVisual emoji={emoji} label={label} className={className} />
      </div>
    );
  }

  return (
    <div className={frameClasses} style={style}>
      <div className="stickers-collection-outline" aria-hidden="true">
        <img
          src={src}
          alt=""
          className="stickers-collection-outline-img"
          draggable={false}
        />
      </div>
      <StickerVisual src={src} label={label} className={className} />
    </div>
  );
}
