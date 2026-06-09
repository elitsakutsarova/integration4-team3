import { createContext, useContext, useEffect, useState } from 'react';
import { loadStickersClient } from '../utils/loadStickersClient';

const StickerCatalogContext = createContext({ stickers: [], loading: true });

export function StickerCatalogProvider({ stickers: initialStickers, children }) {
  const hasInitial = Array.isArray(initialStickers) && initialStickers.length > 0;
  const [stickers, setStickers] = useState(() => (hasInitial ? initialStickers : []));
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    let cancelled = false;

    loadStickersClient()
      .then(fetched => {
        if (!cancelled && fetched.length > 0) {
          setStickers(fetched);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StickerCatalogContext.Provider value={{ stickers, loading }}>
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
