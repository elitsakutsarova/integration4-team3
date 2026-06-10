import { useEffect, useRef, useState } from 'react';
import NewMemoForm from './NewMemoForm';
import BottomNav from './BottomNav';
import { MOCK_MEMORIES, INITIAL_EVENTS } from '../data/mockUser';
import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';
import { addBasemapControl } from '../utils/mapLayers';
import {
  clusterCentroid,
  partitionMemoryPins,
  shouldShowClusters,
} from '../utils/memoryPinCluster';

const ALL_INITIAL_MEMORIES = [...MOCK_MEMORIES, ...GROTE_MARKT_CLUSTER_MEMORIES];

const ANTWERP_CENTER = [51.2194, 4.4025];
const ANTWERP_BOUNDS = [[51.05, 4.15], [51.40, 4.65]];

/* ─── SVG icons for pin HTML ──────────────────────── */
const SQUARE_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <circle cx="8.5" cy="8.5" r="1.5" fill="#18181F" stroke="none"/>
  <path d="M21 15l-5-5L5 21"/>
</svg>`;

const MUSIC_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#18181F">
  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
</svg>`;

/* ─── Pin HTML generators ─────────────────────────── */
function addPinHtml() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="48" viewBox="0 0 34 48" style="cursor:pointer;display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.28))">
    <path d="M17 2C9.82 2 4 7.82 4 15C4 25.5 17 46 17 46C17 46 30 25.5 30 15C30 7.82 24.18 2 17 2Z" fill="#18181F"/>
    <circle cx="17" cy="15" r="9" fill="white"/>
    <circle cx="17" cy="15" r="7" fill="none" stroke="#18181F" stroke-width="1.5"/>
    <line x1="17" y1="11" x2="17" y2="19" stroke="#18181F" stroke-width="2" stroke-linecap="round"/>
    <line x1="13" y1="15" x2="21" y2="15" stroke="#18181F" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function memoryPinHtml() {
  return `<div class="pin-memory">
    <div class="pin-memory-square">${SQUARE_ICON_SVG}</div>
    <div class="pin-memory-drop"><div class="pin-memory-dot"></div></div>
  </div>`;
}

function memoryClusterPinHtml(count) {
  return `<div class="pin-memory-cluster" aria-label="${count} memories">
    <div class="pin-memory-cluster-glow"></div>
    <div class="pin-memory-cluster-head">
      <span class="pin-memory-cluster-count">${count}</span>
      <span class="pin-memory-cluster-label">memories</span>
    </div>
    <div class="pin-memory-cluster-drop"><div class="pin-memory-cluster-dot"></div></div>
  </div>`;
}

function eventPinHtml(label) {
  return `<div class="pin-event">
    <div class="pin-event-glow"></div>
    <div class="pin-event-circle">${MUSIC_ICON_SVG}</div>
    <span class="pin-event-label">${label}</span>
  </div>`;
}

function eventPopupHtml(pin) {
  const tags = pin.tags.map(t => `<span class="event-tag">${t}</span>`).join('');
  return `<div class="event-popup">
    <div class="event-popup-body">
      <div class="event-popup-text">
        <h3 class="event-popup-title">${pin.title}</h3>
        <div class="event-popup-tags">${tags}</div>
        <div class="event-popup-footer">
          <span class="event-popup-likes">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ${pin.likes}
          </span>
          <a class="event-popup-more" href="#">See more</a>
        </div>
      </div>
      <div class="event-popup-image-wrap">
        <img class="event-popup-image" src="${pin.image}" alt="${pin.title}" />
        <span class="event-popup-badge">${pin.badge}</span>
      </div>
    </div>
  </div>`;
}

/* ─── Memory bottom-sheet ─────────────────────────── */
function MemorySheet({ pin, onClose }) {
  if (!pin) return null;
  return (
    <div className="memory-sheet-backdrop" onClick={onClose}>
      <div className="memory-sheet" onClick={e => e.stopPropagation()}>

        <div className="memory-sheet-image">
          {pin.mediaPreview?.url
            ? (pin.mediaPreview.isVideo
                ? <video src={pin.mediaPreview.url} className="memory-sheet-preview-img" controls playsInline />
                : <img src={pin.mediaPreview.url} alt="Memory" className="memory-sheet-preview-img" />)
            : <div className="memory-sheet-img-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0b0b8" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#b0b0b8" stroke="none" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
          }
          <button type="button" className="memory-sheet-heart" aria-label="Save">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181F" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div className="memory-sheet-tags">
            {pin.tags.map(t => <span key={t} className="memory-sheet-tag">{t}</span>)}
          </div>
        </div>

        <div className="memory-sheet-content">
          <p className="memory-sheet-quote">&ldquo;{pin.quote}&rdquo;</p>
          <div className="memory-sheet-actions">
            <span className="memory-sheet-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="memory-sheet-location-name">{pin.location}</span>
            </span>
            <button type="button" className="memory-sheet-cta">Take me there</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────── */
export default function MapView() {
  const containerRef = useRef(null);
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

  /*
   * These refs let Leaflet event handlers (set up once) always call the
   * latest React state setters, even after re-renders.
   */
  const openFormRef = useRef(null);
  openFormRef.current = (latlng) => {
    setFormLatlng(latlng);
    setShowForm(true);
  };

  const selectMemoryRef = useRef(null);
  selectMemoryRef.current = setSelectedMemory;

  /* ── Marker builders ───────────────────────────── */
  function buildMemoryMarker(L, layer, pin) {
    const icon = L.divIcon({
      className: '',
      html: memoryPinHtml(),
      iconSize: [36, 52],
      iconAnchor: [18, 52],
      popupAnchor: [0, -56],
    });
    const marker = L.marker(pin.ll, { icon });
    marker.on('click', () => {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 60);
      selectMemoryRef.current(pin);
    });
    layer.addLayer(marker);
    return marker;
  }

  function buildMemoryClusterMarker(L, map, layer, pins) {
    const count = pins.length;
    const center = clusterCentroid(pins);
    const icon = L.divIcon({
      className: '',
      html: memoryClusterPinHtml(count),
      iconSize: [52, 76],
      iconAnchor: [26, 76],
    });
    const marker = L.marker(center, { icon, zIndexOffset: 500 });
    marker.on('click', () => {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 60);
      const bounds = L.latLngBounds(pins.map(p => p.ll));
      map.fitBounds(bounds.pad(0.15), { maxZoom: 16, animate: true });
    });
    layer.addLayer(marker);
    return marker;
  }

  function syncMemoryLayers(L, map) {
    if (!memoryLayerRef.current) {
      memoryLayerRef.current = L.layerGroup().addTo(map);
    }

    const layer = memoryLayerRef.current;
    layer.clearLayers();

    const { denseGroups, standalonePins } = partitionMemoryPins(memoryPinsRef.current);
    const clustered = shouldShowClusters(map.getZoom());

    standalonePins.forEach(pin => buildMemoryMarker(L, layer, pin));

    denseGroups.forEach(group => {
      if (clustered) {
        buildMemoryClusterMarker(L, map, layer, group);
      } else {
        group.forEach(pin => buildMemoryMarker(L, layer, pin));
      }
    });
  }

  refreshMemoryLayersRef.current = syncMemoryLayers;

  function buildEventMarker(L, map, pin) {
    const icon = L.divIcon({
      className: '',
      html: eventPinHtml(pin.label),
      iconSize: [80, 72],
      iconAnchor: [40, 40],
      popupAnchor: [0, -44],
    });
    const marker = L.marker(pin.ll, { icon }).addTo(map);
    marker.bindPopup(eventPopupHtml(pin), {
      className: 'event-popup-wrapper',
      maxWidth: 340,
      minWidth: 300,
    });
    return marker;
  }

  function placePendingPin(L, map, latlng) {
    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }
    const icon = L.divIcon({
      className: '',
      html: addPinHtml(),
      iconSize: [34, 48],
      iconAnchor: [17, 48],
      popupAnchor: [0, -52],
    });
    const marker = L.marker(latlng, { icon }).addTo(map);
    marker.on('click', () => {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 60);
      openFormRef.current(latlng);
    });
    pendingMarkerRef.current = marker;
  }

  /* ── Leaflet init (runs once) ──────────────────── */
  useEffect(() => {
    if (mapRef.current) return;

    async function init() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      await import('maplibre-gl/dist/maplibre-gl.css');
      await import('@maplibre/maplibre-gl-leaflet');
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
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

      syncMemoryLayers(L, map);
      map.on('zoomend', () => syncMemoryLayers(L, map));

      INITIAL_EVENTS.forEach(pin => {
        if (Array.isArray(pin.ll) && pin.ll.every(n => typeof n === 'number' && Number.isFinite(n))) {
          buildEventMarker(L, map, pin);
        }
      });

      /* Any map click places / moves the pending "add" pin */
      map.on('click', e => {
        if (suppressClickRef.current) return;
        if (!e.latlng || !Number.isFinite(e.latlng.lat) || !Number.isFinite(e.latlng.lng)) return;
        placePendingPin(L, map, e.latlng);
      });

      requestAnimationFrame(() => map.invalidateSize());
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        leafletRef.current = null;
        pendingMarkerRef.current = null;
        memoryLayerRef.current = null;
        refreshMemoryLayersRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Nav "+" button → pin at map center ──────── */
  function handleAddBtnClick() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    placePendingPin(L, map, map.getCenter());
  }

  /* ── Form close (keep pending pin, user can retry) */
  function handleFormClose() {
    setShowForm(false);
    setFormLatlng(null);
  }

  /* ── Publish → convert pending pin to memory pin */
  function handlePublish({ latlng, quote, mediaFile, mediaPreview }) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    const newPin = {
      id: Date.now(),
      ll: [latlng.lat, latlng.lng],
      quote,
      location: 'My spot',
      tags: ['Personal'],
      mediaPreview,
    };

    memoryPinsRef.current.push(newPin);
    refreshMemoryLayersRef.current?.(L, map);
    setShowForm(false);
    setFormLatlng(null);
  }

  return (
    <>
      <div ref={containerRef} className="map-container" />

      <BottomNav active="home" onAddClick={handleAddBtnClick} />

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
