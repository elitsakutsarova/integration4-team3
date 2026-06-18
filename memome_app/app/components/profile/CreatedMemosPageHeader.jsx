import { useNavigate } from 'react-router';
import { paths } from '../../utils/appPaths';
import BackChevron from '../BackChevron';

export default function CreatedMemosPageHeader() {
  const navigate = useNavigate();

  return (
    <header className="created-memos-header">
      <div className="created-memos-hero-deco" aria-hidden="true">
        <span className="created-memos-hero-grid" />
        <span className="created-memos-hero-wave" />
      </div>

      <BackChevron
        className="created-memos-back"
        onClick={() => navigate(paths.profile)}
        label="Back to profile"
      />

      <div className="created-memos-title-bar">
        <h1 className="created-memos-title">Created Memos</h1>
      </div>
    </header>
  );
}
