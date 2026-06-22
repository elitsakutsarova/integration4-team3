import { useLocation } from 'react-router';
import JournalWarningModal from './journals/JournalWarningModal';
import { loginPathWithRedirect, paths } from '../utils/appPaths';

export default function GuestFavoriteModal({ open, onClose }) {
  const { pathname, search } = useLocation();
  const returnPath = `${pathname}${search}`;

  return (
    <JournalWarningModal
      open={open}
      title="You need an account to save favourites"
      description="Create an account or log in to add items to your favourites"
      primaryLabel="Create account"
      primaryTo={paths.register}
      onPrimary={onClose}
      onClose={onClose}
      secondaryLabel="Log in"
      secondaryTo={loginPathWithRedirect(returnPath)}
      onSecondary={onClose}
    />
  );
}
