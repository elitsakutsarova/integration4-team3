/** Public SVG paths for the delete account warning modal. */

const BASE = '/settings/account-details/delete-warning-message';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const deleteWarningAssets = {
  pixelGrid: asset('Vector.svg'),
  vector554: asset('Vector 554.svg'),
  ellipse73: asset('Ellipse 73.svg'),
  deleteWarningIcon: asset('delete_warning_icon.svg'),
};
