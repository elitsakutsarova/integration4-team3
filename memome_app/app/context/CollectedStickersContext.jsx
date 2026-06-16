import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchCollectedStickers } from '../utils/collectibleStore';

const CollectedStickersContext = createContext({
  collectedStickers: [],
  loading: false,
});

/** Stickers come from the root loader; guests also sync from localStorage on the client. */
export function CollectedStickersProvider({ collectedStickers = [], children }) {
  const { user } = useAuth();
  const [guestStickers, setGuestStickers] = useState(collectedStickers);

  useEffect(() => {
    if (user) return undefined;

    let cancelled = false;
    fetchCollectedStickers(null).then(stickers => {
      if (!cancelled) setGuestStickers(stickers);
    });

    return () => {
      cancelled = true;
    };
  }, [user, collectedStickers]);

  const value = useMemo(
    () => ({
      collectedStickers: user ? collectedStickers : guestStickers,
      loading: false,
    }),
    [user, collectedStickers, guestStickers],
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
