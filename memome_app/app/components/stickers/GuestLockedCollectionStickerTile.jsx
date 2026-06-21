import LockedAchievementSilhouette from '../profile/LockedAchievementSilhouette';
import { resolveCollectionSilhouetteShape } from '../../utils/collectionSilhouetteShape';

const LOCKED_BACKDROP_COLOR = '#9CA3AF';

export default function GuestLockedCollectionStickerTile({ sticker }) {
  const backdropStyle = { backgroundColor: LOCKED_BACKDROP_COLOR };
  const silhouetteShape = resolveCollectionSilhouetteShape(sticker.id);

  return (
    <div className="stickers-tile stickers-tile--collection stickers-tile--collection-guest-locked">
      <div className="stickers-achievement-visual">
        <div className="stickers-achievement-frame">
          <div className="stickers-achievement-card" aria-hidden="true" />
          <div className="stickers-achievement-backdrop" style={backdropStyle} aria-hidden="true" />
          <div className="stickers-achievement-art">
            <LockedAchievementSilhouette
              shape={silhouetteShape}
              clipKey={`collection-${sticker.id}`}
            />
          </div>
          <span className="stickers-achievement-mystery-label">?????</span>
        </div>
      </div>
    </div>
  );
}
