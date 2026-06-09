import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authStore from '../utils/authStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authStore.getSession().then(sessionUser => {
      if (active) {
        setUser(sessionUser);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const signUp = useCallback(async payload => {
    const result = await authStore.signUp(payload);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const signIn = useCallback(async payload => {
    const result = await authStore.signIn(payload);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await authStore.signInWithGoogle();
    if (result.user) setUser(result.user);
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
