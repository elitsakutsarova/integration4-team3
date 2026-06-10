import { redirect } from 'react-router';
import { completeAuthRedirect, syncSessionProfile } from '../utils/authStore';

export function meta() {
  return [{ title: 'MemMe — Signing in…' }];
}

/** Handles auth redirect links; saves profile to public.users. */
export async function clientLoader() {
  const result = await completeAuthRedirect();
  if (result.error) {
    const params = new URLSearchParams({ authError: result.error });
    return redirect(`/login?${params.toString()}`);
  }

  await syncSessionProfile();
  return redirect('/');
}

clientLoader.hydrate = true;

export default function AuthCallback() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-dot" />
    </div>
  );
}
