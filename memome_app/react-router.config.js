import os from 'node:os';
import { vercelPreset } from '@vercel/react-router/vite';

const DEV_PORT = '5173';

/** Dev hostnames that may submit actions via single-fetch (CSRF allowlist). */
function buildDevActionOrigins() {
  const hosts = new Set([
    `localhost:${DEV_PORT}`,
    `127.0.0.1:${DEV_PORT}`,
    `memome.local:${DEV_PORT}`,
  ]);

  if (process.env.VITE_ALLOW_LAN === 'true') {
    for (const iface of Object.values(os.networkInterfaces())) {
      for (const addr of iface ?? []) {
        if (addr.family === 'IPv4' && !addr.internal) {
          hosts.add(`${addr.address}:${DEV_PORT}`);
        }
      }
    }
  }

  return [...hosts];
}

export default {
  ssr: true,
  presets: [vercelPreset()],
  allowedActionOrigins: buildDevActionOrigins(),
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
};