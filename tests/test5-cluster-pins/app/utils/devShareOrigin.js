import { getDeviceShareUrl } from './webrtc/peerConnection.js';

export function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'memome.local';
}

/** Resolve HTTPS origin for QR / share links (LAN IP when dev server runs with dev:lan). */
export async function loadDevShareOrigin() {
  if (typeof window === 'undefined') {
    return { shareOrigin: '', lanUrls: [], isOnLocalhost: false };
  }

  const isOnLocalhost = isLocalHost(window.location.hostname);
  const current = getDeviceShareUrl();

  if (!isOnLocalhost) {
    return { shareOrigin: current, lanUrls: [], isOnLocalhost };
  }

  try {
    const res = await fetch('/api/dev-network');
    if (!res.ok) throw new Error('network info unavailable');
    const data = await res.json();
    const lanUrls = Array.isArray(data.lanUrls) ? data.lanUrls : [];
    return { shareOrigin: lanUrls[0] ?? current, lanUrls, isOnLocalhost };
  } catch {
    return { shareOrigin: current, lanUrls: [], isOnLocalhost };
  }
}
