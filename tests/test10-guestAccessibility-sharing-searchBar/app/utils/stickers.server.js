import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stickersFromFilenames } from './stickers';

const STICKERS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public/stickers',
);

export function loadStickersFromPublic() {
  if (!fs.existsSync(STICKERS_DIR)) return [];

  const filenames = fs.readdirSync(STICKERS_DIR);
  return stickersFromFilenames(filenames);
}
