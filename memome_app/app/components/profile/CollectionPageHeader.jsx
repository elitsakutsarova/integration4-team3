import { useNavigate } from 'react-router';
import { goBack, paths } from '../../utils/appPaths';
import BackChevron from '../BackChevron';
import { accountAssets } from '../../utils/accountAssets';

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
    <header className="collection-page-header header">
      <div className="collection-page-hero-deco hero-deco" aria-hidden="true">
              <img className="collection-page-hero-grid hero-grid" src={accountAssets.greenGrid} alt="Decorative pixel grid background" />
              <div className="collection-page-hero-grid-pattern hero-grid-pattern" />
        <img className="collection-page-hero-wave" src={accountAssets.favouritesWave} alt="Decorative wave illustration" />
        <img className="collection-page-hero-heart" src={accountAssets.smallHeart} alt="Decorative heart illustration" />
            </div>
            <div className="collection-page-title-row title-row">
              <div className="collection-page-titles titles">
      <BackChevron className="collection-page-back back btn-chevron" onClick={handleBack} />
      <h1 className="collection-page-title title">{title}</h1>
        </div>
      </div>
    </header>
  );
}
