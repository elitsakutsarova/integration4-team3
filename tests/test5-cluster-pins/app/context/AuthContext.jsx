import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useRevalidator } from 'react-router';
import * as authStore from '../utils/authStore';
import {
  applySignedInUser,
  getAuthServerSnapshot,
  getAuthSnapshot,
  setAuthUser,
  subscribeAuth,
} from '../utils/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const revalidator = useRevalidator();
  const { user, loading } = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  const revalidateApp = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  const signUp = useCallback(async payload => {
    const result = await authStore.signUp(payload);
    if (result.user) {
      await applySignedInUser(result.user);
      revalidateApp();
    }
    return result;
  }, [revalidateApp]);

  const signIn = useCallback(async payload => {
    const result = await authStore.signIn(payload);
    if (result.user) {
      await applySignedInUser(result.user);
      revalidateApp();
    }
    return result;
  }, [revalidateApp]);

  const signInWithGoogle = useCallback(async () => {
    const result = await authStore.signInWithGoogle();
    if (result.user) {
      await applySignedInUser(result.user);
      revalidateApp();
    }
    return result;
  }, [revalidateApp]);

  const signOut = useCallback(async () => {
    await authStore.signOut();
    setAuthUser(null);
    revalidateApp();
  }, [revalidateApp]);

  const resendConfirmationEmail = useCallback(async email => {
    return authStore.resendConfirmationEmail(email);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signInWithGoogle, signOut, resendConfirmationEmail }),
    [user, loading, signUp, signIn, signInWithGoogle, signOut, resendConfirmationEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
