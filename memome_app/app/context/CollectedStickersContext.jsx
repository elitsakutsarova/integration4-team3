import { createContext, useContext, useMemo } from 'react';

const CollectedStickersContext = createContext({
  collectedStickers: [],
  loading: false,
});

/** Stickers come from the root loader — no client-side fetching needed. */
export function CollectedStickersProvider({ collectedStickers = [], children }) {
  const value = useMemo(
    () => ({ collectedStickers, loading: false }),
    [collectedStickers],
  );

  return (
    <CollectedStickersContext.Provider value={value}>
      {children}
    </CollectedStickersContext.Provider>
  );
}

export function useCollectedStickers() {
  return useContext(CollectedStickersContext).collectedStickers;
}

export function useCollectedStickersLoading() {
  return useContext(CollectedStickersContext).loading;
}
