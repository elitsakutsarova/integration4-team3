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
  screen1: {
    phone: screenAsset('screen1', 'phone.png'),
    doodle1: screenAsset('screen1', 'doodle1.svg'),
    doodle2: screenAsset('screen1', 'doodle2.svg'),
    music: screenAsset('screen1', 'music.svg'),
    memo: screenAsset('screen1', 'memo.svg'),
  },
};
