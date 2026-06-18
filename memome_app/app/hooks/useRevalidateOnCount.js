import { useEffect, useRef } from 'react';
import { useRevalidator } from 'react-router';

/** Re-run the route clientLoader when a collection count changes (not on mount). */
export function useRevalidateOnCount(count) {
  const revalidator = useRevalidator();
  const prevRef = useRef(count);

  // Re-run the route loader when a collection count changes (skip initial mount).
  useEffect(() => {
    if (prevRef.current !== count) {
      revalidator.revalidate();
    }
    prevRef.current = count;
  }, [count, revalidator]);
}
