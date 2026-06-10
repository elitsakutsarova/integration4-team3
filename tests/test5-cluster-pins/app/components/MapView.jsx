// orchestration layer -> connects React with the Leaflet map engine

import { useCallback, useRef, useState } from 'react';
import NewMemoForm from './NewMemoForm';
import BottomNav from './BottomNav';
import MemorySheet from './MemorySheet';

//delete later - mock data
import { MOCK_MEMORIES, INITIAL_EVENTS } from '../data/mockUser';
import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';

import { addBasemapControl } from '../utils/mapLayers';
import {
  buildEventMarker,
  placePendingPin,
  syncMemoryLayers,
} from '../utils/mapPins';

const ALL_INITIAL_MEMORIES = [...MOCK_MEMORIES, ...GROTE_MARKT_CLUSTER_MEMORIES];

const ANTWERP_CENTER = [51.2194, 4.4025];
const ANTWERP_BOUNDS = [[51.05, 4.15], [51.40, 4.65]];

export default function MapView() {
  const initTokenRef = useRef(0);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const pendingMarkerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const memoryPinsRef = useRef([...ALL_INITIAL_MEMORIES]);
  const memoryLayerRef = useRef(null);
  const refreshMemoryLayersRef = useRef(null);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLatlng, setFormLatlng] = useState(null);

  const openFormRef = useRef(null);
  openFormRef.current = (latlng) => {
    setFormLatlng(latlng);
    setShowForm(true);
  };

  const selectMemoryRef = useRef(null);
  selectMemoryRef.current = setSelectedMemory;

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
      });

      requestAnimationFrame(() => map.invalidateSize());
    }

    void init();
  }, []);

  function handleAddBtnClick() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    placePendingPin(L, map, map.getCenter(), pendingMarkerRef, suppressClickRef, openFormRef);
  }

  function handleFormClose() {
    setShowForm(false);
    setFormLatlng(null);
  }

  function handlePublish({ latlng, quote, mediaPreview }) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    memoryPinsRef.current.push({
      id: Date.now(),
      ll: [latlng.lat, latlng.lng],
      quote,
      location: 'My spot',
      tags: ['Personal'],
      mediaPreview,
    });

    refreshMemoryLayersRef.current?.(L, map);
    setShowForm(false);
    setFormLatlng(null);
  }

  return (
    <>
      <div ref={attachMapContainer} className="map-container" />

      <BottomNav onAddClick={handleAddBtnClick} />

      {selectedMemory && (
        <MemorySheet pin={selectedMemory} onClose={() => setSelectedMemory(null)} />
      )}

      {showForm && (
        <NewMemoForm
          latlng={formLatlng}
          onClose={handleFormClose}
          onPublish={handlePublish}
        />
      )}
    </>
  );
}
