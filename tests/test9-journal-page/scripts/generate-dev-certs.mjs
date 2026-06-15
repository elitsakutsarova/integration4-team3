#!/usr/bin/env node
/**
 * Generates self-signed TLS certs for local HTTPS dev (LAN + WebRTC secure context).
 * Includes localhost and current LAN IPv4 addresses in SAN.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const certDir = path.join(root, 'certs');
const keyPath = path.join(certDir, 'dev-key.pem');
const certPath = path.join(certDir, 'dev-cert.pem');
const cnfPath = path.join(certDir, 'openssl.cnf');

const checkOnly = process.argv.includes('--check');

function readCertSanIps() {
  try {
    const out = execSync(`openssl x509 -in "${certPath}" -noout -text`, { encoding: 'utf8' });
    return [...out.matchAll(/IP Address:([0-9.]+)/g)].map((match) => match[1]);
  } catch {
    return [];
  }
}

if (checkOnly && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const currentIps = lanIpv4Addresses();
  const certIps = readCertSanIps();
  const missing = currentIps.filter((ip) => !certIps.includes(ip));
  if (missing.length === 0) {
    process.exit(0);
  }
  console.warn(
    `Dev cert is missing current LAN IP(s): ${missing.join(', ')}. Regenerating…`,
  );
}

function lanIpv4Addresses() {
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

try {
  execSync('openssl version', { stdio: 'ignore' });
} catch {
  console.error('OpenSSL is required. Install OpenSSL and re-run: npm run certs:generate');
  process.exit(1);
}

fs.mkdirSync(certDir, { recursive: true });

const ips = lanIpv4Addresses();
const altNames = [
  'DNS.1 = localhost',
  'DNS.2 = memome.local',
  ...ips.map((ip, index) => `IP.${index + 1} = ${ip}`),
].join('\n');

fs.writeFileSync(
  cnfPath,
  `[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = MemMe Dev

[v3_req]
subjectAltName = @alt_names
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
${altNames}
`,
);

execSync(
  `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 825 -nodes -config "${cnfPath}" -extensions v3_req`,
  { stdio: 'inherit' },
);

console.log('\nDev TLS certificate written to certs/');
console.log('Trusted for: localhost, memome.local', ips.length ? `, ${ips.join(', ')}` : '');
console.log('Other devices must trust this cert once (open https://<your-ip>:5173 and accept).\n');
