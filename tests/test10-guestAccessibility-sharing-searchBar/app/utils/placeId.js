/** Helpers for Photon place ids (format: photon/{osmType}/{osmId}). */

const PHOTON_PLACE_RE = /^photon\/([NWR])\/(\d+)$/;

export function isPhotonPlaceId(placeId) {
  return typeof placeId === 'string' && PHOTON_PLACE_RE.test(placeId);
}

export function parsePhotonPlaceId(placeId) {
  const match = PHOTON_PLACE_RE.exec(placeId ?? '');
  if (!match) return null;
  return { osmType: match[1], osmId: match[2] };
}

export function buildPhotonPlaceId(osmType, osmId) {
  return `photon/${osmType}/${osmId}`;
}
