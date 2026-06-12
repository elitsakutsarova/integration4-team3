/**
 * Client route middleware for auth guards.
 *
 * Requires `future.v8_middleware: true` in react-router.config.js (RR v7.16+).
 * Export `clientMiddleware` from route modules — see React Router middleware docs.
 *
 * Session bootstrap uses a singleton promise in authSession.js, so repeated
 * navigations between protected routes do not re-hit Supabase after the first call.
 */

import { redirect } from 'react-router';
import { loginPathWithRedirect, paths } from '../utils/appPaths';
import { bootstrapAuthSession, getAuthSnapshot } from '../utils/authSession';

/** Redirect unauthenticated users to login, preserving intended destination. */
export async function requireAuthClientMiddleware({ request }, next) {
  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  if (!user) {
    const returnPath = `${new URL(request.url).pathname}${new URL(request.url).search}`;
    throw redirect(loginPathWithRedirect(returnPath));
  }
  return next();
}

/** Redirect signed-in users away from guest-only auth routes. */
export async function guestOnlyClientMiddleware(_args, next) {
  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  if (user) {
    throw redirect(paths.home);
  }
  return next();
}

export const requireAuthMiddleware = [requireAuthClientMiddleware];
export const guestOnlyMiddleware = [guestOnlyClientMiddleware];
