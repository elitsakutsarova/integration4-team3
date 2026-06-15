/** Public SVG paths for the Send feedback screen. */

const BASE = '/settings/send-feedback';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const sendFeedbackAssets = {
  topGrid: asset('top-grid.svg'),
  vector551: asset('Vector 551.svg'),
  sendFeedbackIcon: asset('send_feedback_icon.svg'),
};
