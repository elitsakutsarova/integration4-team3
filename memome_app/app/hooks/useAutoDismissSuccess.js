import { useEffect } from 'react';
import { SUCCESS_MESSAGE_DISMISS_MS } from '../utils/successMessage';

/** Auto-dismiss success overlays/toasts after a short delay. */
export function useAutoDismissSuccess(onDismiss, active = true, delayMs = SUCCESS_MESSAGE_DISMISS_MS) {
  useEffect(() => {
    if (!active || !onDismiss) return undefined;

    const timer = window.setTimeout(onDismiss, delayMs);
    return () => window.clearTimeout(timer);
  }, [active, onDismiss, delayMs]);
}
