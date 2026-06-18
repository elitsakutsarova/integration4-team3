/** Public SVG paths for the Forgot password screen. */

const BASE = '/log-in/forgotten-password';

function asset(...segments) {
  return [BASE, ...segments.map((segment) => encodeURIComponent(segment))].join('/');
}

export const forgotPasswordAssets = {
  grid: asset('grid.svg'),
  doodle: asset('doodle.svg'),
  questionMark: asset('question_mark.svg'),
  greenStar: asset('green_star.svg'),
  resetIcon: asset('reset-password', 'reset_icon.svg'),
};
