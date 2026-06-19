/** Decorative assets for the guest add-memo locked screen. */

const BASE = '/account/no-account/add-memo';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const addMemoAssets = {
  locked: asset('locked-add-memo.svg'),
  topGrid: asset('top-grid.svg'),
  topGridAlt: asset('top-grid-1.svg'),
  wave: asset('Vector 559.svg'),
  star: asset('Star 23.svg'),
  lock: asset('Group 2085666426.svg'),
  stickerSmile: asset('Group 2085666422.svg'),
  stickerHeart: asset('Group 2085666423.svg'),
  stickerBurst: asset('Group 2085666432.svg'),
  lockedHeaderWave: asset('arrow.svg'),
  lockedPixelDeco: asset('Vector.svg'),
  camera: asset('camera.svg'),
};
