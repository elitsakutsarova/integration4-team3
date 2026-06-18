/** Public SVG paths for the Create account screen. */

const BASE = '/create-account';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const createAccountAssets = {
  grid: asset('grid.svg'),
  accent: asset('Vector.svg'),
  path: asset('Vector 520.svg'),
  pin: asset('Group 2085666052.svg'),
  heart: asset('Group 2085666057.svg'),
  pin_smooth: asset('pin_no_pixel.svg'),
};
