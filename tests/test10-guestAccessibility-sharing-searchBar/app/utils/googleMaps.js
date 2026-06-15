// utility functions to build the google maps directions url and open them

export function buildGoogleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function openGoogleMapsDirections(lat, lng, event) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    event?.preventDefault();
    return;
  }

  const url = buildGoogleMapsDirectionsUrl(lat, lng);
  window.open(url, '_blank', 'noopener,noreferrer');
  event?.preventDefault();
}
