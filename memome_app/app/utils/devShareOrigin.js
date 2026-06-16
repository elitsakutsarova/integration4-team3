import { getDeviceShareUrl } from './webrtc/peerConnection.js';

export function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'memome.local';
}

function isLanIpv4(hostname) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

/** Resolve HTTPS origin for QR / share links (always prefer dev server LAN IP). */
export async function loadDevShareOrigin() {
  if (typeof window === 'undefined') {
    return { shareOrigin: '', lanUrls: [], isOnLocalhost: false };
  }

  const isOnLocalhost = isLocalHost(window.location.hostname);
  const current = getDeviceShareUrl();

  try {
    const res = await fetch('/api/dev-network');
    if (res.ok) {
      const data = await res.json();
      const lanUrls = Array.isArray(data.lanUrls) ? data.lanUrls : [];
      const shareOrigin = lanUrls[0] ?? (isOnLocalhost ? '' : current);
      return { shareOrigin, lanUrls, isOnLocalhost };
    }
  } catch {
    /* dev-network unavailable */
  }

  if (isLanIpv4(window.location.hostname)) {
    return { shareOrigin: current, lanUrls: [current], isOnLocalhost: false };
  }

  return { shareOrigin: '', lanUrls: [], isOnLocalhost };
}
