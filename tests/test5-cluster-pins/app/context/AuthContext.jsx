//authentication state manager
//exposes auth actions sign up, sign in, sign out
// triggers root revalidation when auth changes, updates global session store
// acts as a bridge between Supabase/auth API (authStore), our internal session system (authSession) andReact UI (context)

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import * as authStore from '../utils/authStore';
import {
  applySignedInUser,
  getAuthServerSnapshot,
  getAuthSnapshot,
  setAuthUser,
  subscribeAuth,
} from '../utils/authSession';
import { signInAccount } from '../utils/authActions';
import { revalidateApp } from '../utils/revalidateApp';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, loading } = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  const signUp = useCallback(async payload => {
    const result = await authStore.signUp(payload);
    if (result.user) {
      await applySignedInUser(result.user);
      revalidateApp();
    }
    return result;
  }, []);

  const signIn = useCallback(payload => signInAccount(payload), []);

  const signOut = useCallback(async () => {
    await authStore.signOut();
    setAuthUser(null);
    revalidateApp();
  }, []);

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signOut }),
    [user, loading, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}