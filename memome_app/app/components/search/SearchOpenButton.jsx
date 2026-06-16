import { useNavigate } from 'react-router';
import { paths } from '../../utils/appPaths';

export default function SearchOpenButton({ className = 'map-search-bar', variant = 'map' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigate(paths.search)}
      aria-label="Search Antwerp places"
    >
      <svg className={`${variant}-search-icon`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span className={`${variant}-search-placeholder`}>Search Antwerp...</span>
      <span className={`${variant}-search-mic`} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
        </svg>
      </span>
    </button>
  );
}
