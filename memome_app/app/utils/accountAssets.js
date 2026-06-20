/** Public SVG paths for the Account / Profile screen. */

const HAS_ACCOUNT = '/account/has-account';
const NO_ACCOUNT_ADD_MEMO = '/account/no-account/add-memo';

function asset(base, filename) {
  return `${base}/${encodeURIComponent(filename)}`;
}

export const accountAssets = {
  blueTopGrid: `${HAS_ACCOUNT}/blue_top-grid.svg`,
  greenTopGrid: `${HAS_ACCOUNT}/green_top-grid.svg`,
  mapIllustration: `${HAS_ACCOUNT}/map_illustration.svg`,
  createdMemosIcon: `${HAS_ACCOUNT}/created_memos_icon.svg`,
  favouritesIcon: `${HAS_ACCOUNT}/favourites_icon.svg`,
  stickersIcon: `${HAS_ACCOUNT}/stickers_icon.svg`,
  noFavouritesIllustration: `${HAS_ACCOUNT}/no_favourites_yet_illustration.svg`,
  emptyStar: asset(NO_ACCOUNT_ADD_MEMO, 'Star 23.svg'),
  emptyGroup1: asset(NO_ACCOUNT_ADD_MEMO, 'Group 2085666422.svg'),
  emptyGroup2: asset(NO_ACCOUNT_ADD_MEMO, 'Group 2085666423.svg'),
  emptyGroup3: asset(NO_ACCOUNT_ADD_MEMO, 'Group 2085666426.svg'),
  emptyGroup4: asset(NO_ACCOUNT_ADD_MEMO, 'Group 2085666432.svg'),
  emptyArrow: asset(NO_ACCOUNT_ADD_MEMO, 'Vector 559.svg'),
  greenGrid: `${HAS_ACCOUNT}/green-grid.svg`,
};
