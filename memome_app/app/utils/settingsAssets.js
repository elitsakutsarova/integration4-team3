/** Public SVG paths for the Settings screen (filenames may contain spaces). */

const BASE = '/settings';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const settingsAssets = {
  topGrid: asset('top-grid.svg'),
  topGrid2: asset('top-grid 2.svg'),
  topGrid3: asset('top-grid 3.svg'),
  maskGroup: asset('Mask group.svg'),
  vector507: asset('Vector 507.svg'),
  vector519: asset('Vector 519.svg'),
  vector533: asset('Vector 533.svg'),
  grid: asset('grid.svg'),
  group5691: asset('Group 2085665691.svg'),
  group6190: asset('Group 2085666190.svg'),
  group6191: asset('Group 2085666191.svg'),
  pixelGrid: asset('Vector.svg'),
  logoutGlyph: asset('Vector-1.svg'),
  ellipse73: asset('Ellipse 73.svg'),
  star21: asset('Star 21.svg'),
  vector554: asset('Vector 554.svg'),
  avatarPlaceholder: asset('avatar_placeholder.svg'),
  leftGridDecoration: asset('left_grid_decoration.svg'),
  greenStar: asset('green_star.svg'),
  languageIcon: asset('language_icon.svg'),
  greenGrid: asset('green-grid.svg'),
  blueGears: asset('blue_gears.svg'),
};
