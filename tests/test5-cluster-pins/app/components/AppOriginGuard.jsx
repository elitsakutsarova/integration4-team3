import { useEffect } from 'react';
import { APP_ORIGIN, isAllowedDevOrigin } from '../config';

/**
 * In dev, redirect to the canonical origin unless LAN access is enabled.
 */
export default function AppOriginGuard({ children }) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (typeof window === 'undefined') return;
    if (isAllowedDevOrigin(window.location.origin)) return;

    const target = `${APP_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }, []);

  return children;
}
