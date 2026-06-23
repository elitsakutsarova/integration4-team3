import '../styles/modules/discover.css';
import '../styles/modules/search.css';
import SearchPage from '../components/search/SearchPage';

export function meta() {
  return [
    { title: 'MemoMe - Search' },
    { name: 'description', content: 'Search for places and spots in Antwerp.' },
  ];
}

export default function SearchRoute() {
  return <SearchPage />;
}
