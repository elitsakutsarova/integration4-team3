// context provider for the created memos

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
import { patchAuthUserCollections } from '../utils/authSession';
import { fetchCreatedMemosByUser } from '../utils/memoStore';
import { paths } from '../utils/appPaths';

const CreatedMemosContext = createContext(null);

function syncCreatedCount(count) {
  patchAuthUserCollections({ memos: count });
}

function mergeCreatedMemos(fetched, existing) {
  const merged = new Map();

  for (const memo of fetched) {
    merged.set(memo.id, memo);
  }

  for (const memo of existing) {
    if (!merged.has(memo.id)) {
      merged.set(memo.id, memo);
    }
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  );
}

function shouldRefreshCreatedMemos(pathname) {
  return pathname.startsWith('/diary/')
    || pathname === paths.journalsCreate
    || pathname === paths.journalsCreateMemos
    || /^\/journals\/[^/]+\/edit/.test(pathname);
}

export function CreatedMemosProvider({ initialMemos = [], children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id ?? null;
  const [createdMemos, setCreatedMemos] = useState(initialMemos);
  const mountedRef = useRef(false);

  // Sync count to auth session whenever memos change.
  useEffect(() => {
    syncCreatedCount(createdMemos.length);
  }, [createdMemos.length]);

  // Initial data comes from the root clientLoader (no fetch on mount).
  // Re-fetch only when userId changes after mount — handles login/logout
  // transitions that don't trigger a full page reload.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!userId) {
      setCreatedMemos([]);
      return;
    }
    fetchCreatedMemosByUser(userId).then(next => setCreatedMemos(next));
  }, [userId]);

  // Silently refresh when visiting journals or diary pages to pick up
  // any memos created since the last root loader run.
  useEffect(() => {
    if (!userId || !shouldRefreshCreatedMemos(pathname)) return;
    fetchCreatedMemosByUser(userId).then(fetched => {
      setCreatedMemos(prev => mergeCreatedMemos(fetched, prev));
    });
  }, [pathname, userId]);

  const prependCreatedMemo = useCallback((memo) => {
    if (!memo?.id) return;
    setCreatedMemos((prev) => {
      if (prev.some((item) => item.id === memo.id)) return prev;
      return [memo, ...prev];
    });
  }, []);

  const updateCreatedMemo = useCallback((memo) => {
    if (!memo?.id) return;
    setCreatedMemos((prev) => {
      const index = prev.findIndex((item) => item.id === memo.id);
      if (index === -1) return [memo, ...prev];
      const next = [...prev];
      next[index] = {
        ...next[index],
        ...memo,
        locationHref: memo.locationHref ?? next[index].locationHref,
      };
      return next;
    });
  }, []);

  const refreshCreatedMemos = useCallback(async ({ silent = false } = {}) => {
    if (!userId) return;
    const fetched = await fetchCreatedMemosByUser(userId);
    setCreatedMemos(prev => (silent ? mergeCreatedMemos(fetched, prev) : fetched));
  }, [userId]);

  const value = useMemo(
    () => ({
      createdMemos,
      createdCount: createdMemos.length,
      ready: true,
      prependCreatedMemo,
      updateCreatedMemo,
      refreshCreatedMemos,
    }),
    [createdMemos, prependCreatedMemo, updateCreatedMemo, refreshCreatedMemos],
  );

  return (
    <CreatedMemosContext.Provider value={value}>
      {children}
    </CreatedMemosContext.Provider>
  );
}

export function useCreatedMemos() {
  const ctx = useContext(CreatedMemosContext);
  if (!ctx) throw new Error('useCreatedMemos must be used within CreatedMemosProvider');
  return ctx;
}
