/** Public SVG paths for the Log in screen. */

const BASE = '/log-in';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const loginAssets = {
  doodle: asset('doodle.svg'),
  pinPhoto: asset('pin_photo.svg'),
};
