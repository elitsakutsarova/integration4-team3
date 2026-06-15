import { useMemo } from 'react';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useStickers } from '../context/StickerCatalogContext';

/** public/stickers + collected digital stickers — for diary render & share export */
export function useDiaryStickerCatalog() {
  const catalogStickers = useStickers();
  const collectedStickers = useCollectedStickers();

  return useMemo(() => {
    const byId = new Map();
    for (const sticker of catalogStickers) byId.set(sticker.id, sticker);
    for (const sticker of collectedStickers) byId.set(sticker.id, sticker);
    return [...byId.values()];
  }, [catalogStickers, collectedStickers]);
}
