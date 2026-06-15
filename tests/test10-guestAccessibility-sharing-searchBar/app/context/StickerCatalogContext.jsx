import { createContext, useContext } from 'react';

const StickerCatalogContext = createContext({ stickers: [], loading: false });

export function StickerCatalogProvider({ stickers = [], children }) {
  return (
    <StickerCatalogContext.Provider value={{ stickers, loading: false }}>
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
