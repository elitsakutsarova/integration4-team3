import os from 'node:os';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', 'memome.local']);

export function getLanIpv4Addresses() {
  try {
    return [
      ...new Set(
        Object.values(os.networkInterfaces())
          .flat()
          .filter(Boolean)
          .filter(entry => entry.family === 'IPv4' && !entry.internal)
          .map(entry => entry.address),
      ),
    ];
  } catch {
    return [];
  }
}

export function getLanUrls(port = 5173) {
  return getLanIpv4Addresses().map(ip => `https://${ip}:${port}`);
}

export function isLocalDevHostname(hostname) {
  return LOCAL_HOSTNAMES.has(hostname);
}

/** Server-side share origin for QR codes (SSR + reliable LAN IP). */
export function resolveDevShareOrigin(request) {
  const url = new URL(request.url);
  const port = Number(url.port || 5173);
  const lanUrls = getLanUrls(port);
  const isOnLocalhost = isLocalDevHostname(url.hostname);

  if (isOnLocalhost) {
    return {
      shareOrigin: lanUrls[0] ?? '',
      lanUrls,
      isOnLocalhost: true,
    };
  }

  const shareOrigin = `${url.protocol}//${url.host}`;
  return { shareOrigin, lanUrls, isOnLocalhost: false };
}
