import { useState } from 'react';
import { sharePageLink } from '../utils/shareLink';

function resolvePayload(payload) {
  return typeof payload === 'function' ? payload() : payload;
}

export function useDiscoverShare(payload) {
  const [showSheet, setShowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;
    setSharing(true);

    try {
      const { title, text } = resolvePayload(payload);
      const result = await sharePageLink({ title, text });
      if (result.shared) {
        setShowSheet(false);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  }

  return {
    showSheet,
    openSheet: () => setShowSheet(true),
    closeSheet: () => setShowSheet(false),
    showSuccess,
    closeSuccess: () => setShowSuccess(false),
    sharing,
    handleShare,
  };
}
