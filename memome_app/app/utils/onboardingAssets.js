/** Public asset paths for onboarding screens. */

const SHARED_BASE = '/onboarding';

function sharedAsset(filename) {
  return `${SHARED_BASE}/${encodeURIComponent(filename)}`;
}

function screenAsset(screen, filename) {
  return `${SHARED_BASE}/${screen}/${encodeURIComponent(filename)}`;
}

export const onboardingAssets = {
  grid: sharedAsset('grid.svg'),
  greenRightDecor: sharedAsset('green_right_decor.svg'),
  greenStar: sharedAsset('green_star.svg'),
  logoVideo: sharedAsset('loading-small.mp4'),
  logoSvg: sharedAsset('logo.svg'),
  screen1: {
    phone: screenAsset('screen1', 'phone.png'),
    doodle1: screenAsset('screen1', 'doodle1.svg'),
    doodle2: screenAsset('screen1', 'doodle2.svg'),
    music: screenAsset('screen1', 'music.svg'),
    memo: screenAsset('screen1', 'memo.png'),
  },
  screen2: {
    texture: screenAsset('screen2', 'texture.svg'),
    memo1: screenAsset('screen2', 'memo1.png'),
    memo2: screenAsset('screen2', 'memo2.png'),
    memo3: screenAsset('screen2', 'memo3.png'),
    doodle1: screenAsset('screen2', 'doodle1.svg'),
    doodle2: screenAsset('screen2', 'doodle2.svg'),
    pin: screenAsset('screen2', 'pin.svg'),
  },
  screen3: {
    phone: screenAsset('screen3', 'phone.png'),
    stickersVisual: screenAsset('screen3', 'stickers_visual.png'),
    stickersBig: screenAsset('screen3', 'stickers-big.png'),
  },
};
