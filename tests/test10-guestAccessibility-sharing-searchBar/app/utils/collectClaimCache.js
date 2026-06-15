// small sessionStorage cache utility
// purpose: user scans QR code -> collection result is stored in sessionStorage
// user refreshes page -> result can be restored without re-processing

import { validateScanKey } from './validators';

const PREFIX = 'memome_collect:';

export function getScanKey(request) {
  const url = new URL(request.url);
  return validateScanKey(url.searchParams.get('scan')).value;
}

export function readCollectCache(scan) {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${scan}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCollectCache(scan, result) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(`${PREFIX}${scan}`, JSON.stringify(result));
}
