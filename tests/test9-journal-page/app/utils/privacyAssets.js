/** Public SVG paths for the Privacy settings screen. */

const BASE = '/settings/privacy';

function asset(filename) {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const privacyAssets = {
  vector552: asset('Vector 552.svg'),
  privacyPageIcon: asset('privacy_page_icon.svg'),
  trackLocationIcon: asset('track_location_icon.svg'),
  cameraIcon: asset('camera_icon.svg'),
  photosIcon: asset('photos_icon.svg'),
};
