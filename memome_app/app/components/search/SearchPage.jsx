// main search page component

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { useEventVenueHrefs } from '../../hooks/useEventVenueHrefs';
import BackChevron from '../BackChevron';
import { EventCard, PlaceCard } from '../discover/DiscoverCards';
import { useAuth } from '../../context/AuthContext';
import { useSpeechSearch } from '../../hooks/useSpeechSearch';
import { goBack, paths } from '../../utils/appPaths';
import SearchListeningView from './SearchListeningView';
import MicrophonePermissionModal from './MicrophonePermissionModal';
import {
  buildGroupedSearchResults,
  eventToRecentEntry,
  getNoResultsSuggestions,
  getSearchSuggestions,
  queryToRecentEntry,
  getSearchFetchState,
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
        layout="list"
        item={{
          id: spot.id,
          title: spot.title,
          location: spot.location,
          tags: spot.tags,
          image: spot.image,
        }}
        faveId={spot.faveId}
        showFave={Boolean(spot.faveId)}
        faveMeta={{
          title: spot.title,
          location: spot.location,
          image: spot.image,
          tags: spot.tags,
        }}
      />
    </div>
  );
}

function SearchNoResults({ query, onSuggestionClick }) {
  const suggestions = getNoResultsSuggestions();

  return (
    <section className="search-page-no-results">
      <p className="search-page-count">0 results found</p>

      <img
        src={NO_SEARCHES_ILLUSTRATION}
        alt=""
        className="search-page-no-results-art"
        aria-hidden="true"
      />

      <h3 className="search-page-no-results-title">
        Hmm, looks like we can&apos;t find anything for &ldquo;{query}&rdquo;.
      </h3>

      <p className="search-page-no-results-subtitle">Try searching for:</p>

      <div className="search-page-suggestions search-page-suggestions--no-results">
        {suggestions.map(term => (
          <button
            key={term}
            type="button"
            className="search-page-suggestion"
            onClick={() => onSuggestionClick(term)}
          >
            {term}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const searchFetcher = useFetcher({ key: 'place-search-page' });
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const requestSearch = useCallback((q) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    searchFetcher.load(`${paths.apiLocationSearch}?q=${encodeURIComponent(trimmed)}`);
  }, [searchFetcher]);

  const triggerSearch = useDebounceCallback(requestSearch, SEARCH_DEBOUNCE_MS);

  const runSearch = useCallback((q) => {
    triggerSearch.cancel();
    requestSearch(q);
  }, [requestSearch, triggerSearch]);

  const handleSpeechTranscript = useCallback((transcript, meta) => {
    if (!transcript) return;
    setQuery(transcript);
    if (!meta?.isFinal) return;
    runSearch(transcript);
  }, [runSearch]);

  const {
    isListening,
    error: speechError,
    permissionBlocked,
    dismissPermissionBlocked,
    stopListening,
    toggleListening,
  } = useSpeechSearch({ onTranscript: handleSpeechTranscript });

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= 2;
  const suggestions = getSearchSuggestions();

  const { isAwaitingResults, photonPlaces, searchError } = getSearchFetchState({
    showResults,
    trimmedQuery,
    fetcherState: searchFetcher.state,
    fetcherData: searchFetcher.data,
  });

  const groupedResults = useMemo(
    () => buildGroupedSearchResults(trimmedQuery, photonPlaces),
    [trimmedQuery, photonPlaces],
  );
  const venueHrefs = useEventVenueHrefs(showResults ? groupedResults.events : []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const stopListeningRef = useRef(stopListening);
  stopListeningRef.current = stopListening;

  useEffect(() => () => stopListeningRef.current(), []);

  useEffect(() => {
    if (authLoading) return;
    setRecentSearches(loadRecentSearches(userId));
  }, [userId, authLoading]);

  function saveRecent(entry) {
    if (authLoading || !entry) return;
    setRecentSearches(addRecentSearch(userId, entry));
  }

  function handleSelectRecent(result) {
    if (!result) return;

    if (result.query) {
      setQuery(result.query);
      runSearch(result.query);
      saveRecent(result);
      inputRef.current?.focus();
      return;
    }

    if (!result.href) return;
    saveRecent(result);
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
    runSearch(term);
    const entry = queryToRecentEntry(term);
    if (entry) saveRecent(entry);
    inputRef.current?.focus();
  }

  function handleSearchSubmit() {
    const entry = queryToRecentEntry(trimmedQuery);
    if (entry) saveRecent(entry);
  }

  const showRecentList = !isListening && !showResults && recentSearches.length > 0;
  const showSuggestions = !isListening && isFocused && !showResults;
  const showEmptyState = !isListening && !showResults && !showRecentList;
  const hasGroupedResults = groupedResults.total > 0;

  function handleMicClick() {
    setIsFocused(true);
    toggleListening();
  }

  function handleBack() {
    stopListening();
    goBack(navigate, paths.home);
  }

  return (
    <div className="search-page">
      <div className="search-page-shell">
        <header className={`search-page-header${isListening ? ' search-page-header--listening' : ''}`}>
          {isListening && (
            <div className="search-page-pixel-deco" aria-hidden="true">
              <span /><span /><span /><span /><span /><span />
            </div>
          )}

          <div className="search-page-header-row">
            <BackChevron className="search-page-back" onClick={handleBack} label="Go back" />

            <div className="search-page-bar">
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
                onChange={event => {
                  const value = event.target.value;
                  setQuery(value);
                  const trimmed = value.trim();
                  if (trimmed.length >= 2) triggerSearch(trimmed);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  if (isListening) return;
                  window.setTimeout(() => setIsFocused(false), 120);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                aria-label="Search Antwerp places, spots and events"
              />
              <button
                type="button"
                className={`search-page-mic${isListening ? ' search-page-mic--active' : ''}`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.focus({ preventScroll: true });
                }}
                onClick={handleMicClick}
                aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                aria-pressed={isListening}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M10.9333 1.1084C11.7618 1.1084 12.5564 1.43751 13.1422 2.02334C13.728 2.60917 14.0571 3.40372 14.0571 4.23221V10.4798C14.0571 11.3083 13.728 12.1029 13.1422 12.6887C12.5564 13.2745 11.7618 13.6036 10.9333 13.6036C10.1048 13.6036 9.31029 13.2745 8.72446 12.6887C8.13863 12.1029 7.80952 11.3083 7.80952 10.4798V4.23221C7.80952 3.40372 8.13863 2.60917 8.72446 2.02334C9.31029 1.43751 10.1048 1.1084 10.9333 1.1084ZM18.2222 10.4798C18.2222 14.1555 15.5045 17.1856 11.9746 17.6958V20.8925H9.89206V17.6958C6.36215 17.1856 3.64444 14.1555 3.64444 10.4798H5.72698C5.72698 11.8606 6.2755 13.1849 7.25188 14.1613C8.22826 15.1377 9.55252 15.6862 10.9333 15.6862C12.3141 15.6862 13.6384 15.1377 14.6148 14.1613C15.5912 13.1849 16.1397 11.8606 16.1397 10.4798H18.2222Z" fill="#202020" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className={`search-page-body${isListening ? ' search-page-body--listening' : ''}`}>
          {isListening && <SearchListeningView error={speechError} />}

          {!isListening && showSuggestions && (
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

          {!isListening && showRecentList && (
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

          {!isListening && showResults && (
            <section className="search-page-section search-page-section--results">
              {isAwaitingResults && <p className="search-page-status">Searching…</p>}
              {searchError && <p className="search-page-status search-page-status--error">{searchError}</p>}

              {!isAwaitingResults && hasGroupedResults && (
                <p className="search-page-count">
                  {groupedResults.total} result{groupedResults.total === 1 ? '' : 's'} found
                </p>
              )}

              {!isAwaitingResults && !hasGroupedResults && !searchError && (
                <SearchNoResults query={trimmedQuery} onSuggestionClick={handleSuggestionClick} />
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
                        <EventCard
                          item={event}
                          layout="list"
                          showFave
                          venueHref={venueHrefs[event.id] ?? null}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {!isListening && showEmptyState && (
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

      <MicrophonePermissionModal
        open={permissionBlocked}
        onClose={dismissPermissionBlocked}
      />
    </div>
  );
}
