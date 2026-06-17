import { useNavigate } from 'react-router';
import { goBack, paths } from '../../utils/appPaths';
import BackChevron from '../BackChevron';

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
      <BackChevron className="collection-page-back" onClick={handleBack} />
      <h1 className="collection-page-title">{title}</h1>
    </header>
  );
}
