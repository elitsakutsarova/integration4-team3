//turning our data (pins, clusters, events) into map markers with custom HTML interface

import {
  clusterCentroid,
  partitionMemoryPins,
  shouldShowClusters,
} from './memoryPinCluster';

const SQUARE_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <circle cx="8.5" cy="8.5" r="1.5" fill="#18181F" stroke="none"/>
  <path d="M21 15l-5-5L5 21"/>
</svg>`;

const MUSIC_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#18181F">
  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
</svg>`;

export function addPinHtml() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="48" viewBox="0 0 34 48" style="cursor:pointer;display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.28))">
    <path d="M17 2C9.82 2 4 7.82 4 15C4 25.5 17 46 17 46C17 46 30 25.5 30 15C30 7.82 24.18 2 17 2Z" fill="#18181F"/>
    <circle cx="17" cy="15" r="9" fill="white"/>
    <circle cx="17" cy="15" r="7" fill="none" stroke="#18181F" stroke-width="1.5"/>
    <line x1="17" y1="11" x2="17" y2="19" stroke="#18181F" stroke-width="2" stroke-linecap="round"/>
    <line x1="13" y1="15" x2="21" y2="15" stroke="#18181F" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

export function memoryPinHtml() {
  return `<div class="pin-memory">
    <div class="pin-memory-square">${SQUARE_ICON_SVG}</div>
    <div class="pin-memory-drop"><div class="pin-memory-dot"></div></div>
  </div>`;
}

export function memoryClusterPinHtml(count) {
  return `<div class="pin-memory-cluster" aria-label="${count} memories">
    <div class="pin-memory-cluster-glow"></div>
    <div class="pin-memory-cluster-head">
      <span class="pin-memory-cluster-count">${count}</span>
      <span class="pin-memory-cluster-label">memories</span>
    </div>
    <div class="pin-memory-cluster-drop"><div class="pin-memory-cluster-dot"></div></div>
  </div>`;
}

export function eventPinHtml(label) {
  return `<div class="pin-event">
    <div class="pin-event-glow"></div>
    <div class="pin-event-circle">${MUSIC_ICON_SVG}</div>
    <span class="pin-event-label">${label}</span>
  </div>`;
}

export function eventPopupHtml(pin) {
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

function suppressNextMapClick(suppressClickRef) {
  suppressClickRef.current = true;
  setTimeout(() => { suppressClickRef.current = false; }, 60);
}

export function buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef) {
  const icon = L.divIcon({
    className: '',
    html: memoryPinHtml(),
    iconSize: [36, 52],
    iconAnchor: [18, 52],
    popupAnchor: [0, -56],
  });
  const marker = L.marker(pin.ll, { icon });
  marker.on('click', () => {
    suppressNextMapClick(suppressClickRef);
    selectMemoryRef.current(pin);
  });
  layer.addLayer(marker);
  return marker;
}

export function buildMemoryClusterMarker(L, map, layer, pins, suppressClickRef) {
  const count = pins.length;
  const icon = L.divIcon({
    className: '',
    html: memoryClusterPinHtml(count),
    iconSize: [52, 76],
    iconAnchor: [26, 76],
  });
  const marker = L.marker(clusterCentroid(pins), { icon, zIndexOffset: 500 });
  marker.on('click', () => {
    suppressNextMapClick(suppressClickRef);
    const bounds = L.latLngBounds(pins.map(p => p.ll));
    map.fitBounds(bounds.pad(0.15), { maxZoom: 17, animate: true });
  });
  layer.addLayer(marker);
  return marker;
}

export function syncMemoryLayers(L, map, memoryPinsRef, memoryLayerRef, suppressClickRef, selectMemoryRef) {
  if (!memoryLayerRef.current) {
    memoryLayerRef.current = L.layerGroup().addTo(map);
  }

  const layer = memoryLayerRef.current;
  layer.clearLayers();

  const { denseGroups, standalonePins } = partitionMemoryPins(memoryPinsRef.current);
  const clustered = shouldShowClusters(map.getZoom());

  standalonePins.forEach(pin => buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef));

  denseGroups.forEach(group => {
    if (clustered) {
      buildMemoryClusterMarker(L, map, layer, group, suppressClickRef);
    } else {
      group.forEach(pin => buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef));
    }
  });
}

export function buildEventMarker(L, map, pin) {
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

export function placePendingPin(L, map, latlng, pendingMarkerRef, suppressClickRef, openFormRef) {
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
    suppressNextMapClick(suppressClickRef);
    openFormRef.current(latlng);
  });
  pendingMarkerRef.current = marker;
}
