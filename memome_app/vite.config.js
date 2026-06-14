import fs from 'node:fs';
import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { stickersManifestPlugin } from './vite-plugin-stickers-manifest.js';
import { webrtcSignalingPlugin } from './vite-plugin-webrtc-signaling.js';

const certDir = path.resolve('certs');
const keyFile = path.join(certDir, 'dev-key.pem');
const certFile = path.join(certDir, 'dev-cert.pem');
const hasCerts = fs.existsSync(keyFile) && fs.existsSync(certFile);

export default defineConfig({
  plugins: [stickersManifestPlugin(), webrtcSignalingPlugin(), reactRouter(), tailwindcss()],
  server: {
    host: process.env.VITE_ALLOW_LAN === 'true' ? true : 'localhost',
    port: 5173,
    strictPort: true,
    https: hasCerts
      ? {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile),
      }
      : undefined,
  },
});
