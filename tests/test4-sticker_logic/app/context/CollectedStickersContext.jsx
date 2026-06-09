import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchCollectedStickers,
} from '../utils/collectibleStore';

const CollectedStickersContext = createContext({
  collectedStickers: [],
  loading: true,
  refreshCollected: async () => {},
});

export function CollectedStickersProvider({ children }) {
  const { user } = useAuth();
  const [collectedStickers, setCollectedStickers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCollected = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchCollectedStickers(user?.id ?? null);
      setCollectedStickers(list);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshCollected();
  }, [refreshCollected]);

  const value = useMemo(
    () => ({ collectedStickers, loading, refreshCollected }),
    [collectedStickers, loading, refreshCollected],
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

export function useRefreshCollectedStickers() {
  return useContext(CollectedStickersContext).refreshCollected;
}
