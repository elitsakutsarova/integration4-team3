import '../styles/modules/search.css';
import SearchPage from '../components/search/SearchPage';
import { paths } from '../utils/appPaths';

export function meta() {
  return [
    { title: 'MemoMe — Search' },
    { name: 'description', content: 'Search for places and spots in Antwerp.' },
  ];
}

export default function DiscoverSearchRoute() {
  return (
    <SearchPage
      fallbackPath={paths.discover}
      className="search-page--discover-panel"
    />
  );
}
