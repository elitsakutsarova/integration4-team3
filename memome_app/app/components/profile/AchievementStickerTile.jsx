import StickerVisual from '../diary/StickerVisual';
import LockedAchievementSilhouette from './LockedAchievementSilhouette';

const ACHIEVEMENT_BACKDROP_COLORS = ['#7597ff', '#99F2D1', '#FBFFAC'];

function getAchievementBackdropColor(stickerId) {
  const seed = String(stickerId).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ACHIEVEMENT_BACKDROP_COLORS[seed % ACHIEVEMENT_BACKDROP_COLORS.length];
}

export default function AchievementStickerTile({ item }) {
  const tileClass = `stickers-tile stickers-tile--achievement${
    item.unlocked ? ' stickers-tile--achievement-unlocked' : ' stickers-tile--achievement-locked'
  }`;
  const backdropStyle = {
    backgroundColor: item.unlocked
      ? getAchievementBackdropColor(item.id)
      : '#9CA3AF',
  };

  return (
    <div className={tileClass}>
      <div className="stickers-achievement-visual">
        <div className="stickers-achievement-frame">
          <div className="stickers-achievement-card" aria-hidden="true" />
          <div className="stickers-achievement-backdrop" style={backdropStyle} aria-hidden="true" />
          <div className="stickers-achievement-art">
            {item.unlocked ? (
              <StickerVisual src={item.src} label={item.label} />
            ) : (
              <LockedAchievementSilhouette stickerId={item.id} />
            )}
          </div>
          <span className={item.unlocked ? 'stickers-achievement-label' : 'stickers-achievement-mystery-label'}>
            {item.unlocked ? item.label : '?????'}
          </span>
        </div>
      </div>
    </div>
  );
}
