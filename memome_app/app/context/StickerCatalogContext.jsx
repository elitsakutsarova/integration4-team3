import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadDigitalStickerCatalog } from '../utils/collectibleStore';

const StickerCatalogContext = createContext({ stickers: [], loading: false });

export function StickerCatalogProvider({ stickers = [], children }) {
  const hasInitialCatalog = stickers.length > 0;
  const [catalog, setCatalog] = useState(stickers);
  const [loading, setLoading] = useState(!hasInitialCatalog);

  // one-time async data fetch on mount
  // the active guard handles the unmount-before-resolve race
  useEffect(() => {
    if (hasInitialCatalog) return undefined;

    let active = true;

    loadDigitalStickerCatalog().then((fetched) => {
      if (!active) return;
      setCatalog(fetched);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [hasInitialCatalog]);

  const value = useMemo(() => ({ stickers: catalog, loading }), [catalog, loading]);

  return (
    <StickerCatalogContext.Provider value={value}>
      {children}
    </StickerCatalogContext.Provider>
  );
}

export function useStickers() {
  return useContext(StickerCatalogContext).stickers;
}

export function useStickersLoading() {
  return useContext(StickerCatalogContext).loading;
}
