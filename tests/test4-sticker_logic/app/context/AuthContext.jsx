import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authStore from '../utils/authStore';
import { mergeGuestStickersIntoAccount, clearGuestStickerCache } from '../utils/collectibleStore';

const AuthContext = createContext(null);

function applyUserUpdate(setUser, nextUser) {
  setUser(prev => (authStore.sameUser(prev, nextUser) ? prev : nextUser));
}

async function attachAccountStickers(userId) {
  await mergeGuestStickersIntoAccount(userId);
  clearGuestStickerCache();
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
          await attachAccountStickers(sessionUser.id);
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

    const unsubscribe = authStore.subscribeToAuthChanges(async nextUser => {
      if (active && nextUser?.id) {
        await attachAccountStickers(nextUser.id);
      }
      if (active) applyUserUpdate(setUser, nextUser);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signUp = useCallback(async payload => {
    const result = await authStore.signUp(payload);
    if (result.user) {
      await attachAccountStickers(result.user.id);
      applyUserUpdate(setUser, result.user);
    }
    return result;
  }, []);

  const signIn = useCallback(async payload => {
    const result = await authStore.signIn(payload);
    if (result.user) {
      await attachAccountStickers(result.user.id);
      applyUserUpdate(setUser, result.user);
    }
    return result;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await authStore.signInWithGoogle();
    if (result.user) {
      await attachAccountStickers(result.user.id);
      applyUserUpdate(setUser, result.user);
    }
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authStore.signOut();
    setUser(null);
  }, []);

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
