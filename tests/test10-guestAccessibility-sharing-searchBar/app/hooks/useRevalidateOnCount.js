import { useEffect, useRef } from 'react';
import { useRevalidator } from 'react-router';

/** Re-run the route clientLoader when a collection count changes (not on mount). */
export function useRevalidateOnCount(count) {
  const revalidator = useRevalidator();
  const prevRef = useRef(count);

  useEffect(() => {
    if (prevRef.current !== count) {
      revalidator.revalidate();
    }
    prevRef.current = count;
  }, [count, revalidator]);
}
