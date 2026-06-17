import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIGITAL_STICKERS_MANIFEST = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public/digitalStickers/manifest.json',
);

/** Digital collectible catalog — used for journal sticker lookup (not the legacy /stickers PNGs). */
export function loadStickersFromPublic() {
  if (!fs.existsSync(DIGITAL_STICKERS_MANIFEST)) return [];

  try {
    const raw = fs.readFileSync(DIGITAL_STICKERS_MANIFEST, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
