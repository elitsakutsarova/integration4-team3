// orchestration layer -> connects React with the Leaflet map engine

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate, useRevalidator, useSearchParams } from 'react-router';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import NewMemoForm from './NewMemoForm';
import MemoLocationPicker from './MemoLocationPicker';
import MapHomeChrome from './MapHomeChrome';
import BottomNav from './BottomNav';
import MemorySheet from './MemorySheet';
import StickerRevealSheet from './StickerRevealSheet';

import { MOCK_MEMORIES, INITIAL_EVENTS } from '../data/mockUser';
import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';

import { readDraftMemo } from '../utils/memoDraft';
import { ANTWERP_BOUNDS_LEAFLET } from '../utils/locationHelpers';
import { filterMapEvents, filterMapMemories } from '../utils/mapFilters';
import { addBasemapControl } from '../utils/mapLayers';
import { resolveNavigableLocationHref } from '../utils/navigableLocation';
import {
  buildEventMarker,
  placePendingPin,
  syncMemoryLayers,
} from '../utils/mapPins';
import { clearStickerReveal, readStickerReveal } from '../utils/stickerReveal';

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

export default function MapView({ savedMemos = [], active = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const draftMemo = readDraftMemo(searchParams);
  const fetcher = useFetcher({ key: 'create-memo' });
  const revalidator = useRevalidator();
  const { prependCreatedMemo, refreshCreatedMemos } = useCreatedMemos();
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
  const [memoryAnchor, setMemoryAnchor] = useState(null);
  const [revealedSticker, setRevealedSticker] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventLocationHrefs, setEventLocationHrefs] = useState(() => new Map());

  const filterOptions = { category: activeCategory, query: searchQuery };

  const savedMemosRef = useRef(savedMemos);
  savedMemosRef.current = savedMemos;

  const filterOptionsRef = useRef(filterOptions);
  filterOptionsRef.current = filterOptions;

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
  selectMemoryRef.current = (pin) => {
    const map = mapRef.current;
    if (map && Array.isArray(pin?.ll) && pin.ll.length >= 2) {
      const point = map.latLngToContainerPoint([pin.ll[0], pin.ll[1]]);
      const rect = map.getContainer().getBoundingClientRect();
      setMemoryAnchor({ x: rect.left + point.x, y: rect.top + point.y });
    } else {
      setMemoryAnchor(null);
    }
    setSelectedMemory(pin);
  };

  const syncMapPins = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const pendingMemo = pendingMemoRef.current;
    const mergedMemos = pendingMemo
      ? [pendingMemo, ...savedMemosRef.current]
      : savedMemosRef.current;
    const allMemos = mergeMapMemories(mergedMemos);
    memoryPinsRef.current = filterMapMemories(allMemos, filterOptionsRef.current);

    refreshMemoryLayersRef.current?.(L, map);
  }, []);

  const pendingMemo = pendingMemoRef.current;
  const mergedMemos = pendingMemo ? [pendingMemo, ...savedMemos] : savedMemos;
  const memoFingerprint = dbMemoFingerprint(mergedMemos);
  const filterFingerprint = `${memoFingerprint}|${activeCategory}|${searchQuery}`;

  useEffect(() => {
    if (!active) {
      setSelectedMemory(null);
      setMemoryAnchor(null);
      setSearchParams({}, { replace: true });
      return;
    }

    const pendingReveal = readStickerReveal();
    if (pendingReveal) {
      setRevealedSticker(pendingReveal);
      revalidator.revalidate();
    }

    const map = mapRef.current;
    if (!map) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [active, setSearchParams, revalidator]);

  function dismissStickerReveal() {
    clearStickerReveal();
    setRevealedSticker(null);
  }

  useEffect(() => {
    if (!active || !selectedMemory) return;

    const map = mapRef.current;
    if (!map || !Array.isArray(selectedMemory.ll) || selectedMemory.ll.length < 2) return;

    function updateAnchor() {
      const point = map.latLngToContainerPoint([selectedMemory.ll[0], selectedMemory.ll[1]]);
      const rect = map.getContainer().getBoundingClientRect();
      setMemoryAnchor({ x: rect.left + point.x, y: rect.top + point.y });
    }

    map.on('move', updateAnchor);
    map.on('zoom', updateAnchor);
    map.on('resize', updateAnchor);

    return () => {
      map.off('move', updateAnchor);
      map.off('zoom', updateAnchor);
      map.off('resize', updateAnchor);
    };
  }, [active, selectedMemory]);

  useEffect(() => {
    if (!pendingMemoRef.current) return;
    if (savedMemos.some(m => m.id === pendingMemoRef.current.id)) {
      pendingMemoRef.current = null;
    }
  }, [savedMemos, memoFingerprint]);

  useEffect(() => {
    if (revalidator.state !== 'idle') return;
    syncMapPins();
  }, [revalidator.state, filterFingerprint, syncMapPins]);

  useEffect(() => {
    let cancelled = false;

    async function resolveEventLocations() {
      const hrefs = new Map();

      await Promise.all(INITIAL_EVENTS.map(async pin => {
        if (!Array.isArray(pin.ll) || pin.ll.some(n => !Number.isFinite(n))) return;

        const href = await resolveNavigableLocationHref({
          placeId: pin.placeId,
          lat: pin.ll[0],
          lng: pin.ll[1],
          name: pin.label,
        });

        if (href) hrefs.set(pin.id, href);
      }));

      if (!cancelled) setEventLocationHrefs(hrefs);
    }

    void resolveEventLocations();
    return () => {
      cancelled = true;
    };
  }, []);

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
      return buildEventMarker(L, map, {
        ...pin,
        locationHref: eventLocationHrefs.get(pin.id) ?? null,
      }, {
        onLocationClick: locationHref => {
          if (locationHref) navigateRef.current(locationHref);
        },
      });
    }).filter(Boolean);

    const featured = eventMarkersRef.current[0];
    if (featured && active && activeCategory === 'All' && !searchQuery.trim()) {
      featured.openPopup();
    }
  }, [active, activeCategory, searchQuery, eventLocationHrefs]);

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
    if (!active || !draftMemo) return;

    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const latlng = { lat: draftMemo.pinLat, lng: draftMemo.pinLng };
    placePendingPin(L, map, latlng, pendingMarkerRef, suppressClickRef, openFormRef);
    map.setView([latlng.lat, latlng.lng], Math.max(map.getZoom(), 13), { animate: false });
  }, [active, draftMemo?.lat, draftMemo?.lng, draftMemo?.pinLat, draftMemo?.pinLng]);

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
        prependCreatedMemo(fetcher.data.memo);
        syncMapPins();
      }

      setSearchParams({}, { replace: true });
      revalidator.revalidate();
      void refreshCreatedMemos({ silent: true });
    }
  }, [fetcher.state, fetcher.data, revalidator, savedMemos, setSearchParams, syncMapPins, prependCreatedMemo, refreshCreatedMemos]);

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
          if (locationHref) navigateRef.current(locationHref);
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
    <div className={`map-page${active ? '' : ' map-page--inactive'}`}>
      <div ref={attachMapContainer} className="map-container" />

      {active && (
        <>
      <MapHomeChrome
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <BottomNav onAddClick={handleAddBtnClick} />

      {selectedMemory && (
        <MemorySheet
          pin={selectedMemory}
          anchor={memoryAnchor}
          onClose={() => {
            setSelectedMemory(null);
            setMemoryAnchor(null);
          }}
        />
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
        />
      )}

      {revealedSticker && (
        <StickerRevealSheet sticker={revealedSticker} onClose={dismissStickerReveal} />
      )}
        </>
      )}
    </div>
  );
}
