/** Build sticker catalog entries from PNG filenames in public/stickers */

export function stickerFromFilename(filename) {
  const base = filename.replace(/\.png$/i, '');
  return {
    id: base.toLowerCase(),
    src: `/stickers/${filename}`,
    label: base.charAt(0).toUpperCase() + base.slice(1),
  };
}

export function stickersFromFilenames(filenames) {
  return filenames
    .filter(name => /\.png$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .map(stickerFromFilename);
}

export function getStickerDef(stickerId, catalog) {
  if (!stickerId || !catalog?.length) return null;
  const id = stickerId.toLowerCase();
  return catalog.find(s => s.id === id) ?? null;
}
