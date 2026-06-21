import { ACHIEVEMENT_STICKER_SHAPES } from '../data/achievementStickerShapes';

const SHAPE_IDS = Object.keys(ACHIEVEMENT_STICKER_SHAPES);

export function resolveCollectionSilhouetteShape(stickerId) {
  const seed = String(stickerId).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const shapeId = SHAPE_IDS[seed % SHAPE_IDS.length];
  return ACHIEVEMENT_STICKER_SHAPES[shapeId];
}
