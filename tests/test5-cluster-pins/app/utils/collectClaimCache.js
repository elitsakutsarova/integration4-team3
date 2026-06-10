const PREFIX = 'memome_collect:';

export function getScanKey(request) {
  const url = new URL(request.url);
  return url.searchParams.get('scan') ?? 'default';
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
