import fs from 'node:fs';
import path from 'node:path';

const MANIFEST_NAME = 'manifest.json';

function stickersFromFilenames(filenames) {
  return filenames
    .filter(name => /\.png$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .map(filename => {
      const base = filename.replace(/\.png$/i, '');
      return {
        id: base.toLowerCase(),
        src: `/stickers/${filename}`,
        label: base.charAt(0).toUpperCase() + base.slice(1),
      };
    });
}

function writeManifest(stickersDir, manifestPath) {
  if (!fs.existsSync(stickersDir)) return;

  const filenames = fs.readdirSync(stickersDir).filter(name => name !== MANIFEST_NAME);
  const manifest = stickersFromFilenames(filenames);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Generates public/stickers/manifest.json from PNG files — served as a static asset on all devices */
export function stickersManifestPlugin() {
  const stickersDir = path.resolve('public/stickers');
  const manifestPath = path.join(stickersDir, MANIFEST_NAME);
  let watcher = null;

  const sync = () => writeManifest(stickersDir, manifestPath);

  return {
    name: 'stickers-manifest',
    buildStart: sync,
    configureServer() {
      sync();
      if (watcher) watcher.close();
      if (!fs.existsSync(stickersDir)) return;
      watcher = fs.watch(stickersDir, { persistent: true }, () => sync());
    },
  };
}
