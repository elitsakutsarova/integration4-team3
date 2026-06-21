import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of `fn` that delays invocation by `delay` ms.
 * The timer is cleared on unmount so stale calls never fire after cleanup.
 */
export function useDebounceCallback(fn, delay) {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  // Clear debounce timer on unmount so a stale callback never fires.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const debounced = useCallback(
    (...args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );

  debounced.cancel = cancel;
  return debounced;
}
