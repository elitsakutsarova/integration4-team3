// context provider for the created memos

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import { useAuth } from './AuthContext';
import { patchAuthUserCollections } from '../utils/authSession';
import { fetchCreatedMemosByUser } from '../utils/memoStore';

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
  return pathname === '/journals' || pathname.startsWith('/diary/');
}

export function CreatedMemosProvider({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id ?? null;
  const [createdMemos, setCreatedMemos] = useState([]);
  const [ready, setReady] = useState(false);

  const prependCreatedMemo = useCallback((memo) => {
    if (!memo?.id) return;

    setCreatedMemos((prev) => {
      if (prev.some((item) => item.id === memo.id)) return prev;
      return [memo, ...prev];
    });
  }, []);

  const loadCreatedMemos = useCallback(async ({ silent = false } = {}) => {
    if (!userId) {
      setCreatedMemos([]);
      setReady(true);
      return;
    }

    if (!silent) setReady(false);
    const fetched = await fetchCreatedMemosByUser(userId);
    setCreatedMemos((prev) => (silent ? mergeCreatedMemos(fetched, prev) : fetched));
    setReady(true);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) {
          setCreatedMemos([]);
          setReady(true);
        }
        return;
      }

      if (!cancelled) setReady(false);
      const next = await fetchCreatedMemosByUser(userId);
      if (cancelled) return;
      setCreatedMemos(next);
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    syncCreatedCount(createdMemos.length);
  }, [createdMemos.length, ready]);

  useEffect(() => {
    if (!userId || !ready || !shouldRefreshCreatedMemos(pathname)) return;
    void loadCreatedMemos({ silent: true });
  }, [loadCreatedMemos, pathname, ready, userId]);

  const value = useMemo(
    () => ({
      createdMemos,
      createdCount: createdMemos.length,
      ready,
      prependCreatedMemo,
      refreshCreatedMemos: loadCreatedMemos,
    }),
    [createdMemos, loadCreatedMemos, prependCreatedMemo, ready],
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
