import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import { useAuth } from './AuthContext';
import { fetchCollectedStickers } from '../utils/collectibleStore';
import { paths } from '../utils/appPaths';

const CollectedStickersContext = createContext(null);

function mergeCollectedStickers(fetched, existing) {
  const merged = new Map();

  for (const sticker of fetched) {
    merged.set(sticker.id, sticker);
  }

  for (const sticker of existing) {
    if (!merged.has(sticker.id)) {
      merged.set(sticker.id, sticker);
    }
  }

  return [...merged.values()];
}

function shouldRefreshCollectedStickers(pathname) {
  return (
    pathname === paths.profile
    || pathname === paths.collect
    || pathname.startsWith('/journals')
  );
}

export function CollectedStickersProvider({ initialStickers = [], children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id ?? null;
  const [collectedStickers, setCollectedStickers] = useState(initialStickers);
  const mountedRef = useRef(false);

  // Re-fetch when userId changes after mount (login/logout without full reload).
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    fetchCollectedStickers(userId).then(setCollectedStickers);
  }, [userId]);

  // Silently merge fresh sticker data after collecting or on profile.
  useEffect(() => {
    if (!shouldRefreshCollectedStickers(pathname)) return;
    fetchCollectedStickers(userId).then((fetched) => {
      setCollectedStickers((prev) => mergeCollectedStickers(fetched, prev));
    });
  }, [pathname, userId]);

  const addCollectedSticker = useCallback((sticker) => {
    if (!sticker?.id) return;
    setCollectedStickers((prev) => {
      if (prev.some((item) => item.id === sticker.id)) return prev;
      return [...prev, sticker];
    });
  }, []);

  const refreshCollectedStickers = useCallback(async ({ silent = false } = {}) => {
    const fetched = await fetchCollectedStickers(userId);
    setCollectedStickers((prev) => (silent ? mergeCollectedStickers(fetched, prev) : fetched));
  }, [userId]);

  const value = useMemo(
    () => ({
      collectedStickers,
      loading: false,
      addCollectedSticker,
      refreshCollectedStickers,
    }),
    [collectedStickers, addCollectedSticker, refreshCollectedStickers],
  );

  return (
    <CollectedStickersContext.Provider value={value}>
      {children}
    </CollectedStickersContext.Provider>
  );
}

function useCollectedStickersContext() {
  const ctx = useContext(CollectedStickersContext);
  if (!ctx) {
    throw new Error('useCollectedStickers must be used within CollectedStickersProvider');
  }
  return ctx;
}

export function useCollectedStickers() {
  return useCollectedStickersContext().collectedStickers;
}

export function useCollectedStickersLoading() {
  return useCollectedStickersContext().loading;
}

export function useCollectedStickersActions() {
  const { addCollectedSticker, refreshCollectedStickers } = useCollectedStickersContext();
  return { addCollectedSticker, refreshCollectedStickers };
}
