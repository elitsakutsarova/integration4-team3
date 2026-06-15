import { useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { EventCard, PlaceCard } from '../discover/DiscoverCards';
import { goBack, paths } from '../../utils/appPaths';
import {
  buildGroupedSearchResults,
  eventToRecentEntry,
  getSearchSuggestions,
  spotToRecentEntry,
} from '../../utils/searchPlaces';
import { addRecentSearch, loadRecentSearches } from '../../utils/searchRecentStore';

const SEARCH_DEBOUNCE_MS = 600;
const NO_SEARCHES_ILLUSTRATION = '/search-bar/no-results/no-searches-illustration.svg';

function SearchSectionTitle({ label, width = 80 }) {
  return (
    <h2 className="search-page-group-title">
      <span className="search-page-group-highlight" style={{ width }} aria-hidden="true" />
      {label}
    </h2>
  );
}

function SearchRecentRow({ result, onSelect }) {
  return (
    <button type="button" className="search-result-row" onClick={() => onSelect(result)}>
      <span className="search-result-icon" aria-hidden="true">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="search-result-copy">
        <span className="search-result-title">{result.name}</span>
        <span className="search-result-address">{result.address}</span>
      </span>
    </button>
  );
}

function SearchSpotCard({ spot, onSelect }) {
  function handleActivate() {
    onSelect(spot);
  }

  return (
    <div
      className="search-spot-card"
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleActivate();
        }
      }}
    >
      <PlaceCard
        item={{
          id: spot.id,
          title: spot.title,
          location: spot.location,
          tags: spot.tags,
          image: spot.image,
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const searchFetcher = useFetcher({ key: 'place-search-page' });
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches());

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= 2;
  const suggestions = getSearchSuggestions();

  const photonPlaces = showResults ? (searchFetcher.data?.places ?? []) : [];
  const searchError = showResults ? searchFetcher.data?.error : null;
  const isSearching = showResults && searchFetcher.state !== 'idle';

  const groupedResults = useMemo(
    () => buildGroupedSearchResults(trimmedQuery, photonPlaces),
    [trimmedQuery, photonPlaces],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 2) return undefined;

    const timer = setTimeout(() => {
      searchFetcher.load(`/api/location-search?q=${encodeURIComponent(trimmedQuery)}`);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmedQuery, searchFetcher.load]);

  function saveRecent(entry) {
    addRecentSearch(entry);
    setRecentSearches(loadRecentSearches());
  }

  function handleSelectRecent(result) {
    if (!result?.href) return;
    navigate(result.href);
  }

  function handleSelectSpot(spot) {
    if (!spot?.href) return;
    saveRecent(spotToRecentEntry(spot));
    navigate(spot.href);
  }

  function handleSelectEvent(event) {
    const entry = eventToRecentEntry(event);
    saveRecent(entry);
    navigate(entry.href);
  }

  function handleSuggestionClick(term) {
    setQuery(term);
    inputRef.current?.focus();
  }

  const showRecentList = !showResults && recentSearches.length > 0;
  const showSuggestions = isFocused && !showResults;
  const showEmptyState = !showResults && !showRecentList;
  const hasGroupedResults = groupedResults.total > 0;

  return (
    <div className="search-page">
      <div className="search-page-shell">
        <header className="search-page-header">
          <div className="search-page-header-row">
            <button
              type="button"
              className="search-page-back"
              onClick={() => goBack(navigate, paths.home)}
              aria-label="Go back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <label className="search-page-bar">
              <svg className="search-page-bar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                className="search-page-input"
                placeholder="Search Antwerp..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label="Search Antwerp places, spots and events"
              />
              <span className="search-page-mic" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </label>
          </div>
        </header>

        <main className="search-page-body">
          {showSuggestions && (
            <section className="search-page-section">
              <h2 className="search-page-section-title">Try searching for</h2>
              <div className="search-page-suggestions">
                {suggestions.map(term => (
                  <button
                    key={term}
                    type="button"
                    className="search-page-suggestion"
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => handleSuggestionClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          {showRecentList && (
            <section className="search-page-section">
              <h2 className="search-page-section-title">Recent searches</h2>
              <div className="search-page-results">
                {recentSearches.map(result => (
                  <div key={result.placeId} className="search-result-item">
                    <SearchRecentRow result={result} onSelect={handleSelectRecent} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {showResults && (
            <section className="search-page-section search-page-section--results">
              {isSearching && <p className="search-page-status">Searching…</p>}
              {searchError && <p className="search-page-status search-page-status--error">{searchError}</p>}

              {!isSearching && hasGroupedResults && (
                <p className="search-page-count">
                  {groupedResults.total} result{groupedResults.total === 1 ? '' : 's'} found
                </p>
              )}

              {!isSearching && !hasGroupedResults && !searchError && (
                <p className="search-page-status">
                  No spots or events found for &ldquo;{trimmedQuery}&rdquo;.
                </p>
              )}

              {groupedResults.spots.length > 0 && (
                <div className="search-page-group">
                  <SearchSectionTitle label="Spots" />
                  <div className="search-page-spots-list">
                    {groupedResults.spots.map(spot => (
                      <SearchSpotCard key={spot.id} spot={spot} onSelect={handleSelectSpot} />
                    ))}
                  </div>
                </div>
              )}

              {groupedResults.spots.length > 0 && groupedResults.events.length > 0 && (
                <hr className="search-page-divider" />
              )}

              {groupedResults.events.length > 0 && (
                <div className="search-page-group">
                  <SearchSectionTitle label="Events" width={88} />
                  <div className="search-page-events-list">
                    {groupedResults.events.map(event => (
                      <div
                        key={event.id}
                        className="search-event-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectEvent(event)}
                        onKeyDown={(eventKey) => {
                          if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                            eventKey.preventDefault();
                            handleSelectEvent(event);
                          }
                        }}
                      >
                        <EventCard item={event} layout="list" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {showEmptyState && (
            <section className="search-page-empty">
              <p className="search-page-section-title search-page-section-title--inline">
                {isFocused ? 'Recent searches' : 'No recent searches yet'}
              </p>

              {showSuggestions && <hr className="search-page-divider" />}

              <img
                src={NO_SEARCHES_ILLUSTRATION}
                alt=""
                className="search-page-empty-art"
                aria-hidden="true"
              />
              <h3 className="search-page-empty-title">You have no recent searches yet.</h3>
              <p className="search-page-empty-copy">
                Search for a place, event or address to see them here.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
