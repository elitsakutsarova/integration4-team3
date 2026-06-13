//turning our data (pins, clusters, events) into map markers with custom HTML interface

import { isSafeHttpsUrl } from './validators';

import {
  clusterCentroid,
  groupPinsBySpot,
  partitionMemoryPins,
  shouldShowClusters,
  shouldShowSpotClusters,
  spreadPinPosition,
} from './memoryPinCluster';

const MUSIC_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#18181F">
  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
</svg>`;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function truncateQuote(text, max = 42) {
  const clean = String(text ?? '').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function pinRotation(id) {
  const seed = String(id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ((seed % 7) - 3) * 3;
}

export function addPinHtml() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="48" viewBox="0 0 34 48" style="cursor:pointer;display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.28))">
    <path d="M17 2C9.82 2 4 7.82 4 15C4 25.5 17 46 17 46C17 46 30 25.5 30 15C30 7.82 24.18 2 17 2Z" fill="#18181F"/>
    <circle cx="17" cy="15" r="9" fill="white"/>
    <circle cx="17" cy="15" r="7" fill="none" stroke="#18181F" stroke-width="1.5"/>
    <line x1="17" y1="11" x2="17" y2="19" stroke="#18181F" stroke-width="2" stroke-linecap="round"/>
    <line x1="13" y1="15" x2="21" y2="15" stroke="#18181F" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function safeAssetUrl(url) {
  return isSafeHttpsUrl(url) ? escapeHtml(url) : '';
}

export function memoryPinHtml(pin) {
  const rotation = pinRotation(pin.id);
  const hasMedia = Boolean(pin.mediaPreview?.url) && isSafeHttpsUrl(pin.mediaPreview.url);
  const body = hasMedia
    ? `<img src="${safeAssetUrl(pin.mediaPreview.url)}" alt="" class="pin-memory-polaroid-img" />`
    : `<p class="pin-memory-polaroid-text"><span class="pin-memory-polaroid-text-highlight">${escapeHtml(truncateQuote(pin.quote))}</span></p>`;

  return `<div class="pin-memory-polaroid" style="--pin-rotate:${rotation}deg">
    <div class="pin-memory-polaroid-frame">${body}</div>
  </div>`;
}

export function memoryClusterPinHtml(count) {
  return `<div class="pin-memory-cluster" aria-label="${count} memories">
    <div class="pin-memory-cluster-stack" aria-hidden="true"></div>
    <div class="pin-memory-cluster-head">
      <span class="pin-memory-cluster-count">${count}</span>
      <span class="pin-memory-cluster-label">memos</span>
    </div>
  </div>`;
}

export function eventPinHtml() {
  return `<div class="pin-event">
    <div class="pin-event-ring pin-event-ring--outer"></div>
    <div class="pin-event-ring pin-event-ring--mid"></div>
    <div class="pin-event-ring pin-event-ring--inner"></div>
    <div class="pin-event-circle">${MUSIC_ICON_SVG}</div>
  </div>`;
}

export function eventPopupHtml(pin) {
  const tags = pin.tags.map(t => `<span class="event-tag">${escapeHtml(t)}</span>`).join('');
  const learnMoreHref = pin.discoverEventId
    ? `/discover/event/${encodeURIComponent(pin.discoverEventId)}`
    : '#';
  const locationHref = pin.locationHref ?? null;
  const locationLabel = locationHref
    ? `<a class="event-popup-location-link" href="${escapeHtml(locationHref)}">${escapeHtml(pin.label)}</a>`
    : `<span class="event-popup-location-link event-popup-location-link--plain">${escapeHtml(pin.label)}</span>`;

  return `<div class="event-popup">
    <div class="event-popup-body">
      <div class="event-popup-text">
        <h3 class="event-popup-title"><span class="event-popup-title-highlight">${escapeHtml(pin.title)}</span></h3>
        <div class="event-popup-tags">${tags}</div>
        <p class="event-popup-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${locationLabel}
        </p>
        <a class="event-popup-cta" href="${learnMoreHref}">Learn more</a>
      </div>
      <div class="event-popup-image-wrap">
        <div class="event-popup-image-shadow" aria-hidden="true"></div>
        <img class="event-popup-image" src="${safeAssetUrl(pin.image)}" alt="${escapeHtml(pin.title)}" />
        <span class="event-popup-badge"><span class="event-popup-badge-dot"></span> ${escapeHtml(pin.badge ?? 'Now')}</span>
      </div>
    </div>
  </div>`;
}

function suppressNextMapClick(suppressClickRef) {
  suppressClickRef.current = true;
  setTimeout(() => { suppressClickRef.current = false; }, 60);
}

export function buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef, displayLl) {
  const ll = displayLl ?? pin.ll;
  const icon = L.divIcon({
    className: '',
    html: memoryPinHtml(pin),
    iconSize: [64, 78],
    iconAnchor: [32, 72],
    popupAnchor: [0, -74],
  });
  const marker = L.marker(ll, { icon });
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
    iconSize: [58, 72],
    iconAnchor: [29, 68],
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

  const allPins = memoryPinsRef.current;
  const zoom = map.getZoom();
  const spotGroups = groupPinsBySpot(allPins);
  const spotHandledIds = new Set();

  for (const group of spotGroups.values()) {
    if (group.length < 2) continue;

    group.forEach(pin => spotHandledIds.add(pin.id));

    if (shouldShowSpotClusters(zoom)) {
      buildMemoryClusterMarker(L, map, layer, group, suppressClickRef);
      continue;
    }

    const center = clusterCentroid(group);
    group.forEach((pin, index) => {
      const ll = spreadPinPosition(center, index, group.length);
      buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef, ll);
    });
  }

  const remaining = allPins.filter(pin => !spotHandledIds.has(pin.id));
  const { denseGroups, standalonePins } = partitionMemoryPins(remaining);
  const areaClustered = shouldShowClusters(zoom);

  standalonePins.forEach(pin =>
    buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef),
  );

  denseGroups.forEach(group => {
    if (areaClustered) {
      buildMemoryClusterMarker(L, map, layer, group, suppressClickRef);
      return;
    }

    const center = clusterCentroid(group);
    group.forEach((pin, index) => {
      const ll = group.length > 1
        ? spreadPinPosition(center, index, group.length)
        : pin.ll;
      buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef, ll);
    });
  });
}

export function buildEventMarker(L, map, pin, { onLocationClick } = {}) {
  const icon = L.divIcon({
    className: '',
    html: eventPinHtml(),
    iconSize: [72, 72],
    iconAnchor: [36, 36],
    popupAnchor: [0, -40],
  });
  const marker = L.marker(pin.ll, { icon }).addTo(map);
  marker.bindPopup(eventPopupHtml(pin), {
    className: 'event-popup-wrapper',
    maxWidth: 340,
    minWidth: 300,
  });

  if (onLocationClick) {
    marker.on('popupopen', () => {
      const link = marker.getPopup()?.getElement()?.querySelector('a.event-popup-location-link');
      if (!link) return;

      const locationHref = link.getAttribute('href');
      if (!locationHref || locationHref === '#') return;

      function handleClick(event) {
        event.preventDefault();
        onLocationClick(locationHref);
      }

      link.addEventListener('click', handleClick);
      marker.once('popupclose', () => link.removeEventListener('click', handleClick));
    });
  }

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
