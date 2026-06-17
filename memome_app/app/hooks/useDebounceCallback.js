import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of `fn` that delays invocation by `delay` ms.
 * The timer is cleared on unmount so stale calls never fire after cleanup.
 */
export function useDebounceCallback(fn, delay) {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback(
    (...args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}
