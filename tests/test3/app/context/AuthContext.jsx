import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authStore from '../utils/authStore';

const AuthContext = createContext(null);

function applyUserUpdate(setUser, nextUser) {
  setUser(prev => (authStore.sameUser(prev, nextUser) ? prev : nextUser));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        let sessionUser = await authStore.getSession();
        if (active && sessionUser) {
          const profile = await authStore.syncSessionProfile();
          if (profile) sessionUser = profile;
          applyUserUpdate(setUser, sessionUser);
        } else if (active) {
          setUser(sessionUser);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    initAuth();

    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async payload => {
    const result = await authStore.signUp(payload);
    if (result.user) applyUserUpdate(setUser, result.user);
    return result;
  }, []);

  const signIn = useCallback(async payload => {
    const result = await authStore.signIn(payload);
    if (result.user) applyUserUpdate(setUser, result.user);
    return result;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await authStore.signInWithGoogle();
    if (result.user) applyUserUpdate(setUser, result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authStore.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signInWithGoogle, signOut }),
    [user, loading, signUp, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
