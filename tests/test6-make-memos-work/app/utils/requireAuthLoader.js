import { redirect } from 'react-router';
import { bootstrapAuthSession, getAuthSnapshot } from './authSession';

/** Use in route clientLoaders — root loader bootstraps auth before child loaders run. */
export async function requireAuthInLoader() {
  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  if (!user) {
    throw redirect('/login');
  }
}

/** Guest-only routes (login/register) — redirect signed-in users to the map. */
export async function redirectIfAuthedInLoader() {
  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  if (user) {
    throw redirect('/');
  }
}
