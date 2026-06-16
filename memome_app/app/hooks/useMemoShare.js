import { useState } from 'react';
import { shareSingleMemo } from '../utils/shareImage';

export function useMemoShare() {
  const [shareMemo, setShareMemo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sharing, setSharing] = useState(false);

  function openShare(memo) {
    setShareMemo(memo);
  }

  function closeShare() {
    setShareMemo(null);
  }

  async function confirmShare() {
    if (!shareMemo || sharing) return;
    setSharing(true);

    try {
      const result = await shareSingleMemo(shareMemo);
      if (result.method !== 'cancelled') {
        setShareMemo(null);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  }

  return {
    shareMemo,
    openShare,
    closeShare,
    confirmShare,
    showSuccess,
    closeSuccess: () => setShowSuccess(false),
    sharing,
  };
}
