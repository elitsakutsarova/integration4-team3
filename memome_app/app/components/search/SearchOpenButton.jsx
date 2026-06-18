import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';

export default function SearchOpenButton({ className = 'map-search-bar', variant = 'map' }) {
  return (
    <Link to={paths.search} className={className} aria-label="Search Antwerp places">
      <svg className={`${variant}-search-icon`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span className={`${variant}-search-placeholder`}>Search Antwerp...</span>
      <span className={`${variant}-search-mic`} aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 22 22" fill="none">
          <path d="M10.9333 1.10791C11.7618 1.10791 12.5564 1.43702 13.1422 2.02285C13.728 2.60868 14.0571 3.40323 14.0571 4.23172V10.4793C14.0571 11.3078 13.728 12.1024 13.1422 12.6882C12.5564 13.274 11.7618 13.6031 10.9333 13.6031C10.1048 13.6031 9.31029 13.274 8.72447 12.6882C8.13864 12.1024 7.80952 11.3078 7.80952 10.4793V4.23172C7.80952 3.40323 8.13864 2.60868 8.72447 2.02285C9.31029 1.43702 10.1048 1.10791 10.9333 1.10791ZM18.2222 10.4793C18.2222 14.155 15.5045 17.1851 11.9746 17.6953V20.892H9.89206V17.6953C6.36216 17.1851 3.64444 14.155 3.64444 10.4793H5.72698C5.72698 11.8601 6.27551 13.1844 7.25189 14.1608C8.22827 15.1372 9.55252 15.6857 10.9333 15.6857C12.3141 15.6857 13.6384 15.1372 14.6148 14.1608C15.5912 13.1844 16.1397 11.8601 16.1397 10.4793H18.2222Z" fill="#202020" />
        </svg>
      </span>
    </Link>
  );
}
