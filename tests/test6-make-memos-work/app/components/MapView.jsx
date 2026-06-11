// orchestration layer -> connects React with the Leaflet map engine

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher, useSearchParams } from 'react-router';
import NewMemoForm from './NewMemoForm';
import MemoLocationPicker from './MemoLocationPicker';
import BottomNav from './BottomNav';
import MemorySheet from './MemorySheet';

import { MOCK_MEMORIES, INITIAL_EVENTS } from '../data/mockUser';
import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';

import { readDraftMemo } from '../utils/memoDraft';
import { ANTWERP_BOUNDS_LEAFLET } from '../utils/locationHelpers';
import { addBasemapControl } from '../utils/mapLayers';
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
  const dbMemos = (savedMemos ?? []).filter(pin => !demoIds.has(pin.id));
  return [...DEMO_MEMORIES, ...dbMemos];
}

export default function MapView({ savedMemos = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const draftMemo = readDraftMemo(searchParams);
  const fetcher = useFetcher({ key: 'create-memo' });
  const initTokenRef = useRef(0);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const pendingMarkerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const memoryPinsRef = useRef(mergeMapMemories(savedMemos));
  const memoryLayerRef = useRef(null);
  const prevDbMemoCountRef = useRef(null);
  // Holds the latest layer-sync fn so Leaflet zoomend handlers never capture a stale closure.
  const refreshMemoryLayersRef = useRef(null);

  const [selectedMemory, setSelectedMemory] = useState(null);

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

  // Keep pin data in sync with loader output (ref write only — safe during render).
  memoryPinsRef.current = mergeMapMemories(savedMemos);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map) refreshMemoryLayersRef.current?.(L, map);
  }, [savedMemos]);

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
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      refreshMemoryLayersRef.current = (l, m) =>
        syncMemoryLayers(l, m, memoryPinsRef, memoryLayerRef, suppressClickRef, selectMemoryRef);

      refreshMemoryLayersRef.current(L, map);
      map.on('zoomend', () => refreshMemoryLayersRef.current?.(L, map));

      INITIAL_EVENTS.forEach(pin => {
        if (Array.isArray(pin.ll) && pin.ll.every(n => typeof n === 'number' && Number.isFinite(n))) {
          buildEventMarker(L, map, pin);
        }
      });

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

  function handleLocationConfirm({ name, lat, lng }) {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.set('lat', String(lat));
        next.set('lng', String(lng));
        next.set('locationName', name);
        next.delete('step');
        return next;
      },
      { replace: true },
    );
  }

  return (
    <>
      <div ref={attachMapContainer} className="map-container" />

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
    </>
  );
}
