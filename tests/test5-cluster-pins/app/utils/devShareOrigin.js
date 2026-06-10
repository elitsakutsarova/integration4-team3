import { useEffect, useState } from 'react';
import { getDeviceShareUrl } from './webrtc/peerConnection.js';

export function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'memome.local';
}

/** Resolve HTTPS origin for QR / share links (LAN IP when dev server runs with dev:lan). */
export function useDevShareOrigin() {
  const [shareOrigin, setShareOrigin] = useState('');
  const [lanUrls, setLanUrls] = useState([]);
  const [isOnLocalhost, setIsOnLocalhost] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsOnLocalhost(isLocalHost(window.location.hostname));

    async function resolve() {
      const current = getDeviceShareUrl();
      if (!isLocalHost(window.location.hostname)) {
        if (!cancelled) setShareOrigin(current);
        return;
      }

      try {
        const res = await fetch('/api/dev-network');
        if (!res.ok) throw new Error('network info unavailable');
        const data = await res.json();
        const urls = Array.isArray(data.lanUrls) ? data.lanUrls : [];
        if (!cancelled) {
          setLanUrls(urls);
          setShareOrigin(urls[0] ?? current);
        }
      } catch {
        if (!cancelled) setShareOrigin(current);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  return { shareOrigin, lanUrls, isOnLocalhost, ready: Boolean(shareOrigin) };
}
