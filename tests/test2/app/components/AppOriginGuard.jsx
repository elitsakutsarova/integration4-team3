import { useEffect } from 'react';
import { APP_ORIGIN } from '../config';

/**
 * In dev, redirect to the canonical origin so auth localStorage stays on localhost:5173.
 */
export default function AppOriginGuard({ children }) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (typeof window === 'undefined') return;
    if (window.location.origin === APP_ORIGIN) return;

    const target = `${APP_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }, []);

  return children;
}
