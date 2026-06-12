// orchestration layer -> connects React with the Leaflet map engine

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate, useRevalidator, useSearchParams } from 'react-router';
import NewMemoForm from './NewMemoForm';
import MemoLocationPicker from './MemoLocationPicker';
import MapHomeChrome from './MapHomeChrome';
import BottomNav from './BottomNav';
import MemorySheet from './MemorySheet';

import { MOCK_MEMORIES, INITIAL_EVENTS } from '../data/mockUser';
import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';

import { readDraftMemo } from '../utils/memoDraft';
import { ANTWERP_BOUNDS_LEAFLET } from '../utils/locationHelpers';
import { filterMapEvents, filterMapMemories } from '../utils/mapFilters';
import { addBasemapControl } from '../utils/mapLayers';
import { navigateToLocationDetail } from '../utils/locationHref';
import {
  buildEventMarker,
  placePendingPin,
  syncMemoryLayers,
} from '../utils/mapPins';

const DEMO_MEMORIES = [...MOCK_MEMORIES, ...GROTE_MARKT_CLUSTER_MEMORIES];

const ANTWERP_CENTER = [51.2194, 4.4025];
const ANTWERP_BOUNDS = ANTWERP_BOUNDS_LEAFLET;

function mergeMapMemories(savedMemos) {
  const demoIds = new Set(DEMO_MEMORIES.map(pin => pin.id));
  const seen = new Set(demoIds);
  const dbMemos = [];

  for (const pin of savedMemos ?? []) {
    if (seen.has(pin.id)) continue;
    seen.add(pin.id);
    dbMemos.push(pin);
  }

  return [...DEMO_MEMORIES, ...dbMemos];
}

function dbMemoFingerprint(savedMemos) {
  return (savedMemos ?? [])
    .filter(m => m.fromDb)
    .map(m => m.id)
    .join(',');
}

export default function MapView({ savedMemos = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const draftMemo = readDraftMemo(searchParams);
  const fetcher = useFetcher({ key: 'create-memo' });
  const revalidator = useRevalidator();
  const handledPublishRef = useRef(false);
  const initTokenRef = useRef(0);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const pendingMarkerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const memoryPinsRef = useRef(mergeMapMemories(savedMemos));
  const memoryLayerRef = useRef(null);
  const eventMarkersRef = useRef([]);
  const pendingMemoRef = useRef(null);
  const prevDbMemoCountRef = useRef(null);
  // Holds the latest layer-sync fn so Leaflet zoomend handlers never capture a stale closure.
  const refreshMemoryLayersRef = useRef(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = { category: activeCategory, query: searchQuery };

  // Live refs: Leaflet registers event handlers once at init — these always point at the
  // current navigate/setState logic without re-binding listeners on every render.
  const openFormRef = useRef(null);
  openFormRef.current = (latlng) => {
    setSearchParams({
      lat: String(latlng.lat),
      lng: String(latlng.lng),
      pinLat: String(latlng.lat),
      pinLng: String(latlng.lng),
    }, { replace: true });
  };

  const selectMemoryRef = useRef(null);
  selectMemoryRef.current = setSelectedMemory;

  const syncMapPins = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map) refreshMemoryLayersRef.current?.(L, map);
  }, []);

  // Keep pin data in sync with loader output (ref write only — safe during render).
  const pendingMemo = pendingMemoRef.current;
  const mergedMemos = pendingMemo ? [pendingMemo, ...savedMemos] : savedMemos;
  const allMemos = mergeMapMemories(mergedMemos);
  memoryPinsRef.current = filterMapMemories(allMemos, filterOptions);

  const memoFingerprint = dbMemoFingerprint(mergedMemos);
  const filterFingerprint = `${memoFingerprint}|${activeCategory}|${searchQuery}`;

  useEffect(() => {
    if (!pendingMemoRef.current) return;
    if (savedMemos.some(m => m.id === pendingMemoRef.current.id)) {
      pendingMemoRef.current = null;
    }
  }, [savedMemos, memoFingerprint]);

  useEffect(() => {
    syncMapPins();
  }, [filterFingerprint, syncMapPins]);

  useEffect(() => {
    if (revalidator.state === 'idle') {
      syncMapPins();
    }
  }, [revalidator.state, filterFingerprint, syncMapPins]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    for (const marker of eventMarkersRef.current) {
      marker.remove();
    }

    const visibleEvents = filterMapEvents(INITIAL_EVENTS, filterOptions);
    eventMarkersRef.current = visibleEvents.map(pin => {
      if (!Array.isArray(pin.ll) || pin.ll.some(n => !Number.isFinite(n))) return null;
      return buildEventMarker(L, map, pin, {
        onLocationClick: locationHref => {
          navigateToLocationDetail(navigateRef.current, locationHref);
        },
      });
    }).filter(Boolean);

    const featured = eventMarkersRef.current[0];
    if (featured && activeCategory === 'All' && !searchQuery.trim()) {
      featured.openPopup();
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const dbMemos = (savedMemos ?? []).filter(m => m.fromDb);
    const count = dbMemos.length;

    if (prevDbMemoCountRef.current === null) {
      prevDbMemoCountRef.current = count;
      return;
    }

    const map = mapRef.current;
    if (map && count > prevDbMemoCountRef.current && dbMemos[0]?.ll) {
      map.setView(dbMemos[0].ll, Math.max(map.getZoom(), 15), { animate: true });
    }
    prevDbMemoCountRef.current = count;
  }, [savedMemos]);

  useEffect(() => {
    if (draftMemo) return;
    if (!pendingMarkerRef.current) return;
    pendingMarkerRef.current.remove();
    pendingMarkerRef.current = null;
  }, [draftMemo]);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      handledPublishRef.current = false;
      return;
    }
    if (fetcher.state !== 'idle' || handledPublishRef.current) return;

    if (fetcher.data?.success) {
      handledPublishRef.current = true;

      if (fetcher.data.memo) {
        pendingMemoRef.current = fetcher.data.memo;
        memoryPinsRef.current = mergeMapMemories([fetcher.data.memo, ...savedMemos]);
        syncMapPins();
      }

      setSearchParams({}, { replace: true });
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator, savedMemos, setSearchParams, syncMapPins]);

  const attachMapContainer = useCallback((node) => {
    if (!node) {
      initTokenRef.current += 1;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        leafletRef.current = null;
        pendingMarkerRef.current = null;
        memoryLayerRef.current = null;
        refreshMemoryLayersRef.current = null;
      }
      return;
    }
    if (mapRef.current) return;

    const token = initTokenRef.current;

    async function init() {
      const L = (await import('leaflet')).default;
      if (token !== initTokenRef.current || mapRef.current) return;

      await import('leaflet/dist/leaflet.css');
      await import('maplibre-gl/dist/maplibre-gl.css');
      await import('@maplibre/maplibre-gl-leaflet');
      if (token !== initTokenRef.current || mapRef.current) return;

      leafletRef.current = L;

      const map = L.map(node, {
        center: ANTWERP_CENTER,
        zoom: 13,
        zoomControl: false,
        maxBounds: ANTWERP_BOUNDS,
        minZoom: 11,
        maxBoundsViscosity: 1.0,
      });
      mapRef.current = map;

      addBasemapControl(L, map, { defaultLayer: 'openfreemap' });

      refreshMemoryLayersRef.current = (l, m) =>
        syncMemoryLayers(l, m, memoryPinsRef, memoryLayerRef, suppressClickRef, selectMemoryRef);

      refreshMemoryLayersRef.current(L, map);
      map.on('zoomend', () => refreshMemoryLayersRef.current?.(L, map));

      const visibleEvents = filterMapEvents(INITIAL_EVENTS, { category: 'All', query: '' });
      eventMarkersRef.current = visibleEvents.map(pin => {
        if (!Array.isArray(pin.ll) || pin.ll.some(n => !Number.isFinite(n))) return null;
        return buildEventMarker(L, map, pin, {
        onLocationClick: locationHref => {
          navigateToLocationDetail(navigateRef.current, locationHref);
        },
      });
      }).filter(Boolean);

      if (eventMarkersRef.current[0]) {
        eventMarkersRef.current[0].openPopup();
      }

      map.on('click', e => {
        if (suppressClickRef.current) return;
        if (!e.latlng || !Number.isFinite(e.latlng.lat) || !Number.isFinite(e.latlng.lng)) return;
        placePendingPin(L, map, e.latlng, pendingMarkerRef, suppressClickRef, openFormRef);
        openFormRef.current(e.latlng);
      });

      requestAnimationFrame(() => map.invalidateSize());
    }

    void init();
  }, []);

  function handleAddBtnClick() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const center = map.getCenter();
    placePendingPin(L, map, center, pendingMarkerRef, suppressClickRef, openFormRef);
    openFormRef.current(center);
  }

  function handleFormClose() {
    setSearchParams({}, { replace: true });
  }

  function handleOpenLocationPicker() {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.set('step', 'location');
        return next;
      },
      { replace: true },
    );
  }

  function handleLocationBack() {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.delete('step');
        return next;
      },
      { replace: true },
    );
  }

  function handleLocationConfirm({ name, lat, lng, placeId = '' }) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map && Number.isFinite(lat) && Number.isFinite(lng)) {
      placePendingPin(L, map, { lat, lng }, pendingMarkerRef, suppressClickRef, openFormRef);
    }

    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.set('lat', String(lat));
        next.set('lng', String(lng));
        next.set('locationName', name);
        if (placeId) next.set('placeId', placeId);
        else next.delete('placeId');
        next.delete('step');
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="map-page">
      <div ref={attachMapContainer} className="map-container" />

      <MapHomeChrome
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <BottomNav onAddClick={handleAddBtnClick} />

      {selectedMemory && (
        <MemorySheet pin={selectedMemory} onClose={() => setSelectedMemory(null)} />
      )}

      {draftMemo?.pickLocation && (
        <MemoLocationPicker
          initialLat={draftMemo.lat}
          initialLng={draftMemo.lng}
          initialName={draftMemo.locationName}
          mapPinLat={draftMemo.pinLat}
          mapPinLng={draftMemo.pinLng}
          onBack={handleLocationBack}
          onConfirm={handleLocationConfirm}
        />
      )}

      {draftMemo && (
        <NewMemoForm
          draft={draftMemo}
          fetcher={fetcher}
          hidden={draftMemo.pickLocation}
          onClose={handleFormClose}
          onChooseLocation={handleOpenLocationPicker}
        />
      )}
    </div>
  );
}
