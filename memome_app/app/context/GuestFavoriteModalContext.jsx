import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import GuestFavoriteModal from '../components/GuestFavoriteModal';

const GuestFavoriteModalContext = createContext(null);

export function GuestFavoriteModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const promptGuestFavorite = useCallback(() => {
    setOpen(true);
  }, []);

  const closeGuestFavorite = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ promptGuestFavorite, closeGuestFavorite }),
    [promptGuestFavorite, closeGuestFavorite],
  );

  return (
    <GuestFavoriteModalContext.Provider value={value}>
      {children}
      <GuestFavoriteModal open={open} onClose={closeGuestFavorite} />
    </GuestFavoriteModalContext.Provider>
  );
}

export function useGuestFavoriteModal() {
  const context = useContext(GuestFavoriteModalContext);
  if (!context) {
    throw new Error('useGuestFavoriteModal must be used within GuestFavoriteModalProvider');
  }
  return context;
}
