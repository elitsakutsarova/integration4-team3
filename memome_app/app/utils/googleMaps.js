// utility functions to build the google maps directions url and open them

export function buildGoogleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function openDirectionsUrl(url, event) {
  if (!url) {
    event?.preventDefault();
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  event?.preventDefault();
}

export function openGoogleMapsDirections(lat, lng, event) {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    event?.preventDefault();
    return;
  }

  openDirectionsUrl(buildGoogleMapsDirectionsUrl(parsedLat, parsedLng), event);
}
