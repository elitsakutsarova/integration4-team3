import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { completeAuthRedirect, syncSessionProfile } from '../utils/authStore';

export function meta() {
  return [{ title: 'MemMe — Signing in…' }];
}

/** Handles OAuth redirect and email-confirm links; saves profile to public.users. */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finish() {
      const result = await completeAuthRedirect();
      if (result.error) {
        navigate('/login', { replace: true, state: { authError: result.error } });
        return;
      }

      await syncSessionProfile();
      navigate('/', { replace: true });
    }

    finish();
  }, [navigate]);

  return (
    <div className="auth-loading">
      <div className="auth-loading-dot" />
    </div>
  );
}
