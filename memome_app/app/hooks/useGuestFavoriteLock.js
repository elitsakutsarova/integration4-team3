import { useAuth } from '../context/AuthContext';
import { useGuestFavoriteModal } from '../context/GuestFavoriteModalContext';

const GUEST_STROKE = '#9CA3AF';
const ACTIVE_STROKE = '#1952ff';

export function useGuestFavoriteLock() {
  const { user } = useAuth();
  const { promptGuestFavorite } = useGuestFavoriteModal();
  const isGuest = !user;

  return {
    isGuest,
    guestLockedClass: isGuest ? ' favorite-btn--guest-locked' : '',
    guestStroke: GUEST_STROKE,
    activeStroke: ACTIVE_STROKE,
    promptGuestFavorite,
  };
}
