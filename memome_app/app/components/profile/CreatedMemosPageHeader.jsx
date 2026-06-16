import { useNavigate } from 'react-router';
import { goBack, paths } from '../../utils/appPaths';

export default function CreatedMemosPageHeader() {
  const navigate = useNavigate();

  return (
    <header className="created-memos-header">
      <div className="created-memos-hero-deco" aria-hidden="true">
        <span className="created-memos-hero-grid" />
        <span className="created-memos-hero-wave" />
      </div>

      <button
        type="button"
        className="created-memos-back"
        onClick={() => goBack(navigate, paths.profile)}
        aria-label="Back to profile"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="created-memos-title-bar">
        <h1 className="created-memos-title">Created Memos</h1>
      </div>
    </header>
  );
}
