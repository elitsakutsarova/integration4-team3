import { useEffect } from 'react';
import { useDiscoverToolbarSlot } from './DiscoverDesktopShell';

export default function DiscoverDesktopToolbar({ children }) {
  const setToolbar = useDiscoverToolbarSlot();

  useEffect(() => {
    if (!setToolbar) {
      return undefined;
    }

    setToolbar(children);
    return () => setToolbar(null);
  }, [children, setToolbar]);

  return null;
}
