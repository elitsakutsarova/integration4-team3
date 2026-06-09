import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { syncSessionProfile } from '../utils/authStore';
import { getSupabaseBrowserClient } from '../utils/supabase.client';

export function meta() {
  return [{ title: 'MemMe — Signing in…' }];
}

/** Handles OAuth redirect and email-confirm links; saves profile to public.users. */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finish() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        navigate('/login', { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error('Auth callback failed:', error.message);
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
