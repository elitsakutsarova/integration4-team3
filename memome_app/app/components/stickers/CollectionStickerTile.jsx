import StickerVisual from '../diary/StickerVisual';
import CollectionNewBadge from './CollectionNewBadge';
import GuestLockedCollectionStickerTile from './GuestLockedCollectionStickerTile';
import { resolveCollectionStickerRotation } from '../../utils/collectionStickerRotation';

export default function CollectionStickerTile({ sticker, locked = false, isNew = false, guestLockedStyle = false }) {
  if (guestLockedStyle && locked) {
    return <GuestLockedCollectionStickerTile sticker={sticker} />;
  }

  const className = `stickers-tile stickers-tile--collection${locked ? ' stickers-tile--locked' : ''}`;
  const rotation = resolveCollectionStickerRotation(sticker);
  const frameStyle = { transform: `rotate(${rotation}deg)` };

  if (!sticker.src) {
    return (
      <div className={className}>
        <div className="stickers-collection-visual">
          <div className="stickers-collection-frame" style={frameStyle}>
            {isNew && <CollectionNewBadge />}
            <StickerVisual emoji={sticker.emoji} label={sticker.label} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="stickers-collection-visual">
        <div className="stickers-collection-frame" style={frameStyle}>
          {isNew && <CollectionNewBadge />}
          <div className="stickers-collection-outline" aria-hidden="true">
            <img
              src={sticker.src}
              alt={sticker.label}
              className="stickers-collection-outline-img"
              draggable={false}
            />
          </div>
          <StickerVisual src={sticker.src} label={sticker.label} />
        </div>
      </div>
    </div>
  );
}
