import StickerVisual from '../diary/StickerVisual';
import LockedAchievementSilhouette from './LockedAchievementSilhouette';

export default function AchievementStickerTile({ item }) {
  if (item.unlocked) {
    return (
      <div className="stickers-tile stickers-tile--achievement stickers-tile--achievement-unlocked">
        <div className="stickers-tile-art">
          <StickerVisual src={item.src} label={item.label} />
        </div>
        <span className="stickers-achievement-label">{item.label}</span>
      </div>
    );
  }

  return (
    <div className="stickers-tile stickers-tile--achievement stickers-tile--achievement-locked">
      <div className="stickers-tile-art">
        <LockedAchievementSilhouette stickerId={item.id} />
      </div>
      <span className="stickers-achievement-mystery-label">?????</span>
    </div>
  );
}
