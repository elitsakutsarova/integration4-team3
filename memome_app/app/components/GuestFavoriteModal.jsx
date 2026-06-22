import { useLocation, useNavigate } from 'react-router';
import JournalWarningModal from './journals/JournalWarningModal';
import { loginPathWithRedirect, paths } from '../utils/appPaths';

export default function GuestFavoriteModal({ open, onClose }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const returnPath = `${pathname}${search}`;

  function handleLogin() {
    onClose();
    navigate(loginPathWithRedirect(returnPath));
  }

  function handleCreateAccount() {
    onClose();
    navigate(paths.register);
  }

  return (
    <JournalWarningModal
      open={open}
      title="You need an account to save favourites"
      description="Create an account or log in to add items to your favourites"
      primaryLabel="Create account"
      onPrimary={handleCreateAccount}
      onClose={onClose}
      secondaryLabel="Log in"
      onSecondary={handleLogin}
    />
  );
}
