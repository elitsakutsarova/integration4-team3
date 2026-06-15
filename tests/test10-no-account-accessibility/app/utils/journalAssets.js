/** Decorative assets for the Journals page (public/journals). */

const LOCKED_BASE = '/journals/journals-locked';

function lockedAsset(filename) {
  return `${LOCKED_BASE}/${encodeURIComponent(filename)}`;
}

export const journalAssets = {
  gridPattern: '/journals/Group 2085666333.svg',
  headerWave: '/journals/Vector 421.svg',
  pixelDeco: '/journals/Vector.svg',
  logoMark: '/journals/Group 2085666334.svg',
  emptyIllustration: '/journals/empty_state_journals.svg',
  emptyArrow: '/journals/Vector 500.svg',
  addMenu: '/journals/add-menu.svg',
  lockedIllustration: lockedAsset('Group 2085666392.svg'),
  lockedHeaderWave: lockedAsset('Vector 421.svg'),
  lockedPixelDeco: lockedAsset('Vector.svg'),
  lockedLogoMark: lockedAsset('Group 2085666334.svg'),
  createHeaderWave: '/journals/create-journal/Vector 421.svg',
  createPixelDeco: '/journals/create-journal/Group 2085666254.svg',
  warningGrid: '/journals/create-journal/warning-message/Vector.svg',
  warningWave: '/journals/create-journal/warning-message/Vector 421.svg',
  warningIcon: '/journals/create-journal/warning-message/Group 2085666392.svg',
};
