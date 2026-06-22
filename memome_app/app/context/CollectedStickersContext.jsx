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
import { readLastNewStickerId, writeLastNewStickerId } from '../utils/collectionNewSticker';
import { paths } from '../utils/appPaths';

const CollectedStickersContext = createContext(null);

function pickNewerClaimedAt(left, right) {
  const leftTime = left?.claimedAt ? Date.parse(left.claimedAt) : Number.NaN;
  const rightTime = right?.claimedAt ? Date.parse(right.claimedAt) : Number.NaN;

  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
    return leftTime >= rightTime ? left.claimedAt : right.claimedAt;
  }

  return left?.claimedAt ?? right?.claimedAt;
}

function mergeStickerRecords(fetched, existing) {
  return {
    ...existing,
    ...fetched,
    claimedAt: pickNewerClaimedAt(fetched, existing),
  };
}

function mergeCollectedStickers(fetched, existing) {
  const merged = new Map();

  for (const sticker of existing) {
    merged.set(sticker.id, sticker);
  }

  for (const sticker of fetched) {
    const prev = merged.get(sticker.id);
    merged.set(
      sticker.id,
      prev ? mergeStickerRecords(sticker, prev) : sticker,
    );
  }

  return [...merged.values()];
}

function shouldRefreshCollectedStickers(pathname) {
  return (
    pathname === paths.profile
    || pathname === paths.stickers
    || pathname.startsWith('/journals')
  );
}

export function CollectedStickersProvider({ initialStickers = [], children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id ?? null;
  const [collectedStickers, setCollectedStickers] = useState(initialStickers);
  const [lastNewStickerId, setLastNewStickerId] = useState(() => readLastNewStickerId());
  const mountedRef = useRef(false);

  // Keep context aligned when root clientLoader revalidates (e.g. after collect clientAction).
  useEffect(() => {
    setCollectedStickers((prev) => mergeCollectedStickers(initialStickers, prev));
  }, [initialStickers]);

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
    writeLastNewStickerId(sticker.id);
    setLastNewStickerId(sticker.id);
    setCollectedStickers((prev) => {
      const claimedAt = sticker.claimedAt ?? new Date().toISOString();
      const next = { ...sticker, claimedAt };
      const index = prev.findIndex((item) => item.id === sticker.id);

      if (index === -1) return [...prev, next];

      const existing = prev[index];
      const existingTime = existing.claimedAt ? Date.parse(existing.claimedAt) : Number.NaN;
      const nextTime = Date.parse(claimedAt);

      if (!Number.isFinite(nextTime) || (Number.isFinite(existingTime) && nextTime <= existingTime)) {
        return prev;
      }

      const updated = [...prev];
      updated[index] = mergeStickerRecords(next, existing);
      return updated;
    });
  }, []);

  const refreshCollectedStickers = useCallback(async ({ silent = false } = {}) => {
    const fetched = await fetchCollectedStickers(userId);
    setCollectedStickers((prev) => (silent ? mergeCollectedStickers(fetched, prev) : fetched));
  }, [userId]);

  const value = useMemo(
    () => ({
      collectedStickers,
      lastNewStickerId,
      loading: false,
      addCollectedSticker,
      refreshCollectedStickers,
    }),
    [collectedStickers, lastNewStickerId, addCollectedSticker, refreshCollectedStickers],
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

export function useLastNewStickerId() {
  return useCollectedStickersContext().lastNewStickerId;
}
