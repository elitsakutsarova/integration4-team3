import fs from 'node:fs';
import path from 'node:path';

const PUBLIC = path.join(process.cwd(), 'public');

function readJson(relativePath) {
  try {
    const raw = fs.readFileSync(path.join(PUBLIC, relativePath), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadDigitalStickerCatalog() {
  const data = readJson('digitalStickers/manifest.json');
  return Array.isArray(data) ? data : [];
}

export function loadPhysicalLocations() {
  const data = readJson('physicalStickers/locations.json');
  return Array.isArray(data) ? data : [];
}

export function getLocationById(locationId) {
  return loadPhysicalLocations().find(
    loc => loc.id === locationId && loc.active !== false,
  ) ?? null;
}

export function getDigitalStickerById(stickerId) {
  return loadDigitalStickerCatalog().find(s => s.id === stickerId) ?? null;
}
