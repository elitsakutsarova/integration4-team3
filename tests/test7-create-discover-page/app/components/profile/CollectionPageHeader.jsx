// header for the collection page

import { useNavigate } from 'react-router';
import { goBack } from '../../utils/navigationBack';
import { paths } from '../../utils/appPaths';

export default function CollectionPageHeader({
  title,
  backTo = paths.profile,
  explicitBack = false,
}) {
  const navigate = useNavigate();

  function handleBack() {
    if (explicitBack) {
      navigate(backTo);
      return;
    }
    goBack(navigate, backTo);
  }

  return (
    <header className="collection-page-header">
      <button
        type="button"
        className="collection-page-back"
        onClick={handleBack}
        aria-label="Back"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="collection-page-title">{title}</h1>
    </header>
  );
}
