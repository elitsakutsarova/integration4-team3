// location picker modal for creating a memory

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import { paths } from '../utils/appPaths';
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
  return `<div class="loc-picker-pin loc-picker-pin--gray"></div>`;
}

function selectedPinHtml(label) {
  return `<div class="loc-picker-pin-wrap">
    <div class="loc-picker-pin loc-picker-pin--selected"></div>
    <span class="loc-picker-pin-label">${escapeHtml(label)}</span>
  </div>`;
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
  const searchFetcher = useFetcher({ key: 'location-search' });
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const initTokenRef = useRef(0);

  const [query, setQuery] = useState(initialName);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState(() => {
    if (initialName && Number.isFinite(initialLat) && Number.isFinite(initialLng)) {
      return { name: initialName, lat: initialLat, lng: initialLng, id: 'initial' };
    }
    return null;
  });
  const [geoError, setGeoError] = useState('');

  const searchPlaces = searchFetcher.data?.places ?? [];
  const searchError = query.trim().length >= 2 ? searchFetcher.data?.error : null;
  const isSearching = searchFetcher.state !== 'idle' && query.trim().length >= 2;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return undefined;

    const timer = setTimeout(() => {
      searchFetcher.load(`${paths.apiLocationSearch}?q=${encodeURIComponent(q)}`);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, searchFetcher.load]);

  const suggestions = searchPlaces;
  const canConfirm = Boolean(selected?.name && Number.isFinite(selected.lat) && Number.isFinite(selected.lng));

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
      selectedMarkerRef.current = L.marker([nextSelected.lat, nextSelected.lng], { icon, zIndexOffset: 1000 }).addTo(map);
      map.setView([nextSelected.lat, nextSelected.lng], Math.max(map.getZoom(), 15), { animate: true });
    }
  }

  const selectPlaceRef = useRef(null);
  selectPlaceRef.current = (place) => {
    setQuery(place.name);
    setSelected(place);
    setGeoError('');
  };

  const selectCustomRef = useRef(null);
  selectCustomRef.current = (latlng) => {
    if (!latlng) return;
    const place = createCustomPlace(latlng.lat, latlng.lng);
    selectPlaceRef.current?.(place);
  };

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
        if (!e.latlng) return;
        selectCustomRef.current?.(e.latlng);
      });

      requestAnimationFrame(() => map.invalidateSize());
    }

    void init();
  }, [initialLat, initialLng, initialName]);

  function handleUseMapPin() {
    if (!Number.isFinite(mapPinLat) || !Number.isFinite(mapPinLng)) {
      setGeoError('No map pin found. Tap the map to place one.');
      return;
    }

    const place = createCustomPlace(mapPinLat, mapPinLng);
    selectPlaceRef.current?.(place);
    setGeoError('');
  }

  function handleSuggestionPick(place) {
    selectPlaceRef.current?.(place);
  }

  function handleConfirm() {
    if (!canConfirm || !selected) return;
    if (!isInAntwerpBounds(selected.lat, selected.lng)) {
      setGeoError('This location is outside Antwerp. Pick a spot within the city.');
      return;
    }
    onConfirm({
      name: selected.name,
      lat: selected.lat,
      lng: selected.lng,
      placeId: selected.id?.startsWith('photon/') ? selected.id : '',
    });
  }

  return (
    <div className="loc-picker-overlay" role="dialog" aria-modal="true" aria-label="Select a location">
      <div className="loc-picker-sheet">
        <header className="loc-picker-header">
          <button type="button" className="form-close-btn" onClick={onBack} aria-label="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="form-title">Location</h2>
          <div className="form-header-spacer" />
        </header>

        <div className="loc-picker-map-wrap">
          <div ref={attachMap} className="loc-picker-map" />
          {!selected && (
            <button type="button" className="loc-picker-geo-btn" onClick={handleUseMapPin}>
              Use current location
            </button>
          )}
        </div>

        <div className="loc-picker-body">
          <h3 className="loc-picker-heading">Select a location</h3>
          <p className="loc-picker-sub">
            Search for a place, tap the map for a custom pin, or use your map pin
          </p>

          <input
            type="search"
            className="loc-picker-search"
            placeholder="Where did your memory happen?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search location"
            autoComplete="off"
          />

          {isSearching && (
            <p className="loc-picker-meta">Searching…</p>
          )}

          {suggestions.length > 0 && (
            <ul className="loc-picker-suggestions" role="listbox">
              {suggestions.map(place => (
                <li key={place.id}>
                  <button
                    type="button"
                    className={`loc-picker-suggestion${selected?.id === place.id ? ' loc-picker-suggestion--active' : ''}`}
                    role="option"
                    aria-selected={selected?.id === place.id}
                    onClick={() => handleSuggestionPick(place)}
                  >
                    <span className="loc-picker-suggestion-name">{place.name}</span>
                    <span className="loc-picker-suggestion-cat">{place.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.trim().length >= 2 && !isSearching && suggestions.length === 0 && !searchError && (
            <p className="loc-picker-hint">No matches — tap the map to pin this spot manually.</p>
          )}

          {(searchError || geoError) && (
            <p className="loc-picker-error" role="alert">{searchError || geoError}</p>
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

        <footer className="loc-picker-footer">
          <button
            type="button"
            className={`loc-picker-confirm${canConfirm ? ' loc-picker-confirm--active' : ''}`}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </footer>
      </div>
    </div>
  );
}
