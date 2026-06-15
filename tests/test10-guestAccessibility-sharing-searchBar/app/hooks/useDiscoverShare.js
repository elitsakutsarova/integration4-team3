import { useState } from 'react';
import { sharePageLink } from '../utils/shareLink';

export function useDiscoverShare({ title, text }) {
  const [showSheet, setShowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;
    setSharing(true);

    try {
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
