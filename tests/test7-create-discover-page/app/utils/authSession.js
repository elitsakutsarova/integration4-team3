import * as authStore from './authStore';
import {
  clearGuestStickerCache,
  mergeLocalStickersIntoAccount,
} from './collectibleStore';
import {
  clearGuestDiscoverFavesCache,
  mergeLocalDiscoverFavesIntoAccount,
} from './discoverFavesStore';
import {
  clearGuestSavedMemosCache,
  mergeLocalSavedMemosIntoAccount,
} from './savedMemosStore';

const SERVER_SNAPSHOT = { user: null, loading: true };

let snapshot = { user: null, loading: true };
const listeners = new Set();
let bootstrapPromise = null;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getAuthSnapshot() {
  return snapshot;
}

/** True after the first auth bootstrap finished (success or failure). */
export function isAuthBootstrapped() {
  return snapshot.loading === false;
}

export function getAuthServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function attachAccountCollections(userId) {
  await mergeLocalStickersIntoAccount(userId);
  await mergeLocalDiscoverFavesIntoAccount(userId);
  await mergeLocalSavedMemosIntoAccount(userId);
  clearGuestStickerCache();
  clearGuestDiscoverFavesCache();
  clearGuestSavedMemosCache();
}

export function setAuthUser(user) {
  const next = authStore.sameUser(snapshot.user, user) ? snapshot.user : user;
  if (snapshot.user === next && snapshot.loading === false) return;
  snapshot = { user: next, loading: false };
  emit();
}

export function patchAuthUserCollections(collections) {
  if (!snapshot.user) return;
  snapshot = {
    user: {
      ...snapshot.user,
      collections: { ...snapshot.user.collections, ...collections },
    },
    loading: false,
  };
  emit();
}

/**
 * Hydrates session before the app renders.
 * Cached via singleton promise — no repeat Supabase fetch on later navigations.
 */
export async function bootstrapAuthSession() {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      let user = await authStore.getSession();
      if (user?.id) {
        const profile = await authStore.syncSessionProfile();
        if (profile) user = profile;
        await attachAccountCollections(user.id);
      }
      snapshot = { user, loading: false };
    } catch {
      snapshot = { user: null, loading: false };
    }

    emit();

    authStore.subscribeToAuthChanges(async nextUser => {
      if (nextUser?.id) await attachAccountCollections(nextUser.id);
      setAuthUser(nextUser);
    });

    return snapshot.user;
  })();

  return bootstrapPromise;
}

export async function applySignedInUser(user) {
  if (!user) return;
  await attachAccountCollections(user.id);
  setAuthUser(user);
}
