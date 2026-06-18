// location picker modal for creating a memory

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDebounceCallback } from '../hooks/useDebounceCallback';
import { useSpeechSearch } from '../hooks/useSpeechSearch';
import SearchListeningView from './search/SearchListeningView';
import { fetchLocationSearchClient } from '../utils/fetchLocationSearchClient';
import { locationPickerAssets } from '../utils/locationPickerAssets';
import {
  addLocationPickerRecent,
  loadLocationPickerRecents,
} from '../utils/locationPickerRecentStore';
import {
  ANTWERP_BOUNDS_LEAFLET,
  createCustomPlace,
  isInAntwerpBounds,
  placesForMapPins,
} from '../utils/locationHelpers';
import { addBasemapControl } from '../utils/mapLayers';

const ANTWERP_CENTER = [51.2194, 4.4025];
const ANTWERP_BOUNDS = ANTWERP_BOUNDS_LEAFLET;
const SEARCH_DEBOUNCE_MS = 600;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function grayPinHtml() {
  return '<div class="loc-picker-pin loc-picker-pin--gray"></div>';
}

function selectedPinHtml(label) {
  return `<div class="loc-picker-pin-wrap">
    <div class="loc-picker-pin loc-picker-pin--selected"></div>
    <span class="loc-picker-pin-label">${escapeHtml(label)}</span>
  </div>`;
}

function placeSubtitle(place) {
  return place.address || place.category || 'Antwerp, Belgium';
}

function recentToPlace(entry) {
  return {
    id: entry.placeId,
    name: entry.name,
    lat: entry.lat,
    lng: entry.lng,
    address: entry.address,
    category: entry.address,
  };
}

function LocPickerResultRow({ title, subtitle, onClick }) {
  return (
    <button type="button" className="loc-picker-result-row" onClick={onClick}>
      <span className="loc-picker-result-icon" aria-hidden="true">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="loc-picker-result-copy">
        <span className="loc-picker-result-title">{title}</span>
        <span className="loc-picker-result-subtitle">{subtitle}</span>
      </span>
    </button>
  );
}

export default function MemoLocationPicker({
  initialLat,
  initialLng,
  initialName = '',
  mapPinLat,
  mapPinLng,
  onBack,
  onConfirm,
}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const initTokenRef = useRef(0);
  const inputRef = useRef(null);

  const [query, setQuery] = useState(initialName);
  const [isFocused, setIsFocused] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [recentPlaces, setRecentPlaces] = useState([]);
  const [selected, setSelected] = useState(() => {
    if (initialName && Number.isFinite(initialLat) && Number.isFinite(initialLng)) {
      return { name: initialName, lat: initialLat, lng: initialLng, id: 'initial' };
    }
    return null;
  });
  const [geoError, setGeoError] = useState('');
  const [searchPlaces, setSearchPlaces] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRequestIdRef = useRef(0);

  const runSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setSearchPlaces([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    setIsSearching(true);

    const result = await fetchLocationSearchClient(trimmed);
    if (searchRequestIdRef.current !== requestId) return;

    setIsSearching(false);
    setSearchPlaces(result.places);
    setSearchError(result.error);
  }, []);

  const triggerSearch = useDebounceCallback((q) => {
    void runSearch(q);
  }, SEARCH_DEBOUNCE_MS);

  const handleSpeechTranscript = useCallback((transcript, meta) => {
    if (!transcript) return;
    setQuery(transcript);
    setIsFocused(true);
    const trimmed = transcript.trim();
    if (trimmed.length >= 2 && (meta?.isFinal ?? true)) {
      triggerSearch(trimmed);
    }
  }, [triggerSearch]);

  const {
    isListening,
    error: speechError,
    stopListening,
    toggleListening,
  } = useSpeechSearch({ onTranscript: handleSpeechTranscript });

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= 2;
  const showPanel = isListening || isFocused || showResults;
  const showRecents = !isListening && !showResults && recentPlaces.length > 0;
  const showPanelRef = useRef(showPanel);
  showPanelRef.current = showPanel;

  // Reload recent place picks when the signed-in user changes.
  useEffect(() => {
    setRecentPlaces(loadLocationPickerRecents(userId));
  }, [userId]);

  function saveRecent(place) {
    const entry = {
      placeId: place.id,
      name: place.name,
      address: placeSubtitle(place),
      lat: place.lat,
      lng: place.lng,
    };
    setRecentPlaces(addLocationPickerRecent(userId, entry));
  }

  function confirmPlace(place) {
    if (!place?.name || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;

    if (!isInAntwerpBounds(place.lat, place.lng)) {
      setGeoError('This location is outside Antwerp. Pick a spot within the city.');
      return;
    }

    if (place.id && place.id !== 'initial') saveRecent(place);

    onConfirm({
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      placeId: place.id?.startsWith('photon/') ? place.id : '',
    });
  }

  function refreshMarkers(L, map, nextSelected, allPlaces, searchQuery) {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    const pinPlaces = placesForMapPins(allPlaces, searchQuery).filter(
      place => place.id !== nextSelected?.id && place.name !== nextSelected?.name,
    );

    pinPlaces.forEach(place => {
      const icon = L.divIcon({
        className: '',
        html: grayPinHtml(),
        iconSize: [14, 14],
        iconAnchor: [7, 14],
      });
      const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
      marker.on('click', () => selectPlaceRef.current?.(place));
      markersRef.current.push(marker);
    });

    if (nextSelected) {
      const icon = L.divIcon({
        className: '',
        html: selectedPinHtml(nextSelected.name),
        iconSize: [120, 52],
        iconAnchor: [60, 52],
      });
      selectedMarkerRef.current = L.marker(
        [nextSelected.lat, nextSelected.lng],
        { icon, zIndexOffset: 1000 },
      ).addTo(map);
      map.setView([nextSelected.lat, nextSelected.lng], Math.max(map.getZoom(), 15), { animate: true });
    }
  }

  const selectPlaceRef = useRef(null);
  selectPlaceRef.current = (place) => {
    setQuery(place.name);
    setSelected(place);
    setGeoError('');
    confirmPlace(place);
  };

  const selectCustomRef = useRef(null);
  selectCustomRef.current = (latlng) => {
    if (!latlng) return;
    const place = createCustomPlace(latlng.lat, latlng.lng);
    selectPlaceRef.current?.(place);
  };

  // Sync Leaflet markers when search results or the selected place change.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map && mapReady) refreshMarkers(L, map, selected, searchPlaces, query);
  }, [searchPlaces, query, selected, mapReady]);

  const attachMap = useCallback((node) => {
    if (!node) {
      initTokenRef.current += 1;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        leafletRef.current = null;
        markersRef.current = [];
        selectedMarkerRef.current = null;
      }
      return;
    }
    if (mapRef.current) return;

    const token = initTokenRef.current;
    const startSelected =
      initialName && Number.isFinite(initialLat) && Number.isFinite(initialLng)
        ? { name: initialName, lat: initialLat, lng: initialLng, id: 'initial' }
        : null;

    async function init() {
      const L = (await import('leaflet')).default;
      if (token !== initTokenRef.current || mapRef.current) return;

      await import('leaflet/dist/leaflet.css');
      await import('maplibre-gl/dist/maplibre-gl.css');
      await import('@maplibre/maplibre-gl-leaflet');
      if (token !== initTokenRef.current || mapRef.current) return;

      leafletRef.current = L;

      const center = startSelected
        ? [startSelected.lat, startSelected.lng]
        : Number.isFinite(initialLat) && Number.isFinite(initialLng)
          ? [initialLat, initialLng]
          : ANTWERP_CENTER;

      const map = L.map(node, {
        center,
        zoom: 15,
        zoomControl: false,
        maxBounds: ANTWERP_BOUNDS,
        minZoom: 11,
        maxBoundsViscosity: 1.0,
      });
      mapRef.current = map;

      addBasemapControl(L, map, { defaultLayer: 'openfreemap' });
      setMapReady(true);

      map.on('click', (e) => {
        if (showPanelRef.current) return;
        if (!e.latlng) return;
        selectCustomRef.current?.(e.latlng);
      });

      requestAnimationFrame(() => map.invalidateSize());
    }

    void init();
  }, [initialLat, initialLng, initialName]);

  // Leaflet needs invalidateSize when the search panel resizes the map area.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [mapReady, showPanel]);

  const stopListeningRef = useRef(stopListening);
  stopListeningRef.current = stopListening;

  // Stop voice search when leaving the location picker.
  useEffect(() => () => stopListeningRef.current(), []);

  function handleBack() {
    stopListening();
    onBack();
  }

  function handleUseMapPin() {
    if (!Number.isFinite(mapPinLat) || !Number.isFinite(mapPinLng)) {
      setGeoError('No map pin found. Tap the map to place one.');
      return;
    }

    const place = createCustomPlace(mapPinLat, mapPinLng);
    selectPlaceRef.current?.(place);
    setGeoError('');
  }

  function handleMicClick() {
    setIsFocused(true);
    toggleListening();
  }

  function handlePickPlace(place) {
    setQuery(place.name);
    setSelected(place);
    setGeoError('');
    confirmPlace(place);
  }

  function handlePickRecent(entry) {
    handlePickPlace(recentToPlace(entry));
  }

  return (
    <div className="loc-picker-overlay" role="dialog" aria-modal="true" aria-label="Select a location">
      <div ref={attachMap} className="loc-picker-map" />

      <div className={`loc-picker-ui${showPanel ? ' loc-picker-ui--panel' : ''}`}>
        <header className={`loc-picker-header${isListening ? ' loc-picker-header--listening' : ''}`}>
          {isListening && (
            <div className="loc-picker-pixel-deco" aria-hidden="true">
              <span /><span /><span /><span /><span /><span />
            </div>
          )}

          <div className="loc-picker-hero-deco" aria-hidden="true">
            <div className="loc-picker-grid-gradient" />
            <div className="loc-picker-grid-pattern" />
            <div className="loc-picker-pixel-deco loc-picker-pixel-deco--hero">
              <span /><span /><span /><span />
            </div>
            <img
              className="loc-picker-pin-deco"
              src={locationPickerAssets.pinDeco}
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="loc-picker-title-bar">
            <button type="button" className="loc-picker-back-btn" onClick={handleBack} aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1952FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="loc-picker-title">Location</h2>
            <div className="loc-picker-title-spacer" aria-hidden="true" />
          </div>

          <div className="loc-picker-search-bar">
            <svg className="loc-picker-search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              className="loc-picker-search-input"
              placeholder="Search Antwerp..."
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                const trimmed = value.trim();
                if (trimmed.length >= 2) triggerSearch(trimmed);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                if (isListening) return;
                window.setTimeout(() => setIsFocused(false), 120);
              }}
              aria-label="Search Antwerp locations"
              autoComplete="off"
            />
            <button
              type="button"
              className={`loc-picker-mic${isListening ? ' loc-picker-mic--active' : ''}`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.focus({ preventScroll: true });
              }}
              onClick={handleMicClick}
              aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
              aria-pressed={isListening}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {showPanel && (
          <div className="loc-picker-panel">
            {isListening && (
              <SearchListeningView
                error={speechError}
                title="Listening..."
                copy="Say a place name or address in Antwerp."
              />
            )}

            {!isListening && showRecents && (
              <section className="loc-picker-section">
                <h3 className="loc-picker-section-title">Recents</h3>
                <div className="loc-picker-results">
                  {recentPlaces.map(entry => (
                    <div key={entry.placeId} className="loc-picker-result-item">
                      <LocPickerResultRow
                        title={entry.name}
                        subtitle={entry.address}
                        onClick={() => handlePickRecent(entry)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!isListening && showResults && (
              <section className="loc-picker-section loc-picker-section--results">
                {isSearching && <p className="loc-picker-status">Searching…</p>}

                {!isSearching && searchPlaces.length > 0 && (
                  <div className="loc-picker-results">
                    {searchPlaces.map(place => (
                      <div key={place.id} className="loc-picker-result-item">
                        <LocPickerResultRow
                          title={place.name}
                          subtitle={placeSubtitle(place)}
                          onClick={() => handlePickPlace(place)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {!isSearching && !searchError && searchPlaces.length === 0 && (
                  <p className="loc-picker-hint">No matches — tap the map to pin this spot manually.</p>
                )}
              </section>
            )}

            {!isListening && !showRecents && !showResults && isFocused && (
              <p className="loc-picker-hint">Search for a place in Antwerp or use your current map pin.</p>
            )}

            {(geoError || (showResults && searchError)) && !isListening && (
              <p className="loc-picker-error" role="alert">{geoError || searchError}</p>
            )}

            <p className="loc-picker-attribution">
              Place data ©{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
                OpenStreetMap
              </a>{' '}
              contributors ·{' '}
              <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">
                ODbL
              </a>
            </p>
          </div>
        )}
      </div>

      {!showPanel && (
        <button type="button" className="loc-picker-geo-btn" onClick={handleUseMapPin}>
          Use current location
        </button>
      )}

      {geoError && !showPanel && (
        <p className="loc-picker-error loc-picker-error--floating" role="alert">{geoError}</p>
      )}
    </div>
  );
}
