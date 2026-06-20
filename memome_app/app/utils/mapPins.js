//turning our data (pins, clusters, events) into map markers with custom HTML interface

import { isSafeHttpsUrl } from './validators';
import { discoverEventPath } from './appPaths';
import {
  EVENT_PIN_SIZE,
  applyPolaroidOrientationClass,
  buildMemoMediaClassName,
  eventCenterIconSvg,
  memoryPinDimensions,
  pinHasMedia,
  readMediaDimensions,
  resolveEventIconTag,
  resolveMemoPinSvg,
  resolvePolaroidOrientation,
  TAG_PIN_HEIGHT,
  TAG_PIN_WIDTH,
} from './memoPinAssets';

import {
  CLUSTER_MAX_ZOOM,
  SPOT_CLUSTER_MAX_ZOOM,
  clusterCentroid,
  groupPinsBySpot,
  partitionMemoryPins,
  shouldShowClusters,
  shouldShowSpotClusters,
  spreadPinPosition,
} from './memoryPinCluster';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function safeAssetUrl(url) {
  return isSafeHttpsUrl(url) ? escapeHtml(url) : '';
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

function tagPinHtml(pin) {
  const pinSvg = resolveMemoPinSvg(pin);
  return `<div class="pin-memory-tag">
    <img class="pin-memory-tag-svg" src="${escapeHtml(pinSvg)}" alt="" />
  </div>`;
}

function mediaPinHtml(pin) {
  const pinSvg = resolveMemoPinSvg(pin);
  const mediaUrl = safeAssetUrl(pin.mediaPreview.url);
  const isVideo = Boolean(pin.mediaPreview?.isVideo);
  const orientation = resolvePolaroidOrientation(pin);
  const orientClass = orientation === 'horizontal'
    ? 'pin-memory-polaroid--horizontal'
    : 'pin-memory-polaroid--vertical';
  const mediaClass = buildMemoMediaClassName('pin-memory-polaroid-img', orientation);
  const mediaMarkup = isVideo
    ? `<video src="${mediaUrl}" class="${mediaClass}" muted playsinline preload="metadata"></video>
       <span class="pin-memory-polaroid-play" aria-hidden="true"></span>`
    : `<img src="${mediaUrl}" alt="" class="${mediaClass}" />`;

  return `<div class="pin-memory-polaroid ${orientClass}">
    <div class="pin-memory-polaroid-frame">
      <div class="pin-memory-polaroid-photo">${mediaMarkup}</div>
    </div>
    <img class="pin-memory-polaroid-tag" src="${escapeHtml(pinSvg)}" alt="" />
  </div>`;
}

function bindPolaroidOrientation(marker, pin) {
  marker.on('add', () => {
    const root = marker.getElement()?.querySelector('.pin-memory-polaroid');
    if (!root || root.dataset.oriented === '1') return;

    const storedWidth = Number(pin?.mediaPreview?.width);
    const storedHeight = Number(pin?.mediaPreview?.height);
    if (applyPolaroidOrientationClass(root, storedWidth, storedHeight)) return;

    const url = pin?.mediaPreview?.url;
    if (!url) return;

    readMediaDimensions(url, { isVideo: Boolean(pin.mediaPreview?.isVideo) })
      .then(({ width, height }) => {
        if (!marker.getElement()?.contains(root)) return;
        applyPolaroidOrientationClass(root, width, height);
      });
  });
}

export function memoryPinHtml(pin) {
  if (pinHasMedia(pin)) {
    return mediaPinHtml(pin);
  }
  return tagPinHtml(pin);
}

export function memoryClusterPinHtml(count) {
  return `<div class="pin-memory-cluster" aria-label="${count} memories">
    <img class="pin-memory-cluster-svg" src="/memos/pin_random.svg" alt="" />
    <span class="pin-memory-cluster-count">${count}</span>
  </div>`;
}

export function eventPinHtml(pin) {
  const iconMarkup = eventCenterIconSvg(resolveEventIconTag(pin));
  return `<div class="pin-event">
    <img class="pin-event-rings" src="/memos/event_pin_rings.svg" alt="" />
    <div class="pin-event-core"><div class="pin-event-core-disc">${iconMarkup}</div></div>
  </div>`;
}

export function eventPopupHtml(pin) {
  const tags = pin.tags.map(t => `<span class="event-tag">${escapeHtml(t)}</span>`).join('');
  const learnMoreHref = pin.discoverEventId
    ? discoverEventPath(pin.discoverEventId)
    : null;
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
        ${learnMoreHref ? `<a class="event-popup-cta" href="${learnMoreHref}">Learn more</a>` : ''}
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
  const dimensions = memoryPinDimensions(pin);
  const icon = L.divIcon({
    className: 'pin-memory-marker',
    html: memoryPinHtml(pin),
    iconSize: dimensions.iconSize,
    iconAnchor: dimensions.iconAnchor,
    popupAnchor: dimensions.popupAnchor,
  });
  const marker = L.marker(ll, { icon });
  if (pinHasMedia(pin)) bindPolaroidOrientation(marker, pin);
  marker.on('click', (event) => {
    L.DomEvent.stopPropagation(event);
    suppressNextMapClick(suppressClickRef);
    selectMemoryRef.current?.(pin, ll);
  });
  layer.addLayer(marker);
  return marker;
}

export function buildMemoryClusterMarker(L, map, layer, pins, suppressClickRef, minExpandZoom) {
  const count = pins.length;
  const icon = L.divIcon({
    className: 'pin-memory-marker',
    html: memoryClusterPinHtml(count),
    iconSize: [TAG_PIN_WIDTH, TAG_PIN_HEIGHT],
    iconAnchor: [TAG_PIN_WIDTH / 2, TAG_PIN_HEIGHT],
  });
  const marker = L.marker(clusterCentroid(pins), { icon, zIndexOffset: 500 });
  marker.on('click', (event) => {
    L.DomEvent.stopPropagation(event);
    suppressNextMapClick(suppressClickRef);
    const bounds = L.latLngBounds(pins.map(p => p.ll));
    map.fitBounds(bounds.pad(0.15), { maxZoom: 17, animate: true });
    map.once('moveend', () => {
      if (map.getZoom() < minExpandZoom) {
        map.setZoom(minExpandZoom, { animate: true });
      }
    });
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

  if (shouldShowClusters(zoom)) {
    const { denseGroups, standalonePins } = partitionMemoryPins(allPins);

    standalonePins.forEach(pin =>
      buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef),
    );

    denseGroups.forEach(group =>
      buildMemoryClusterMarker(
        L,
        map,
        layer,
        group,
        suppressClickRef,
        CLUSTER_MAX_ZOOM + 1,
      ),
    );
    return;
  }

  const spotGroups = groupPinsBySpot(allPins);
  const spotHandledIds = new Set();

  for (const group of spotGroups.values()) {
    if (group.length < 2) continue;

    group.forEach(pin => spotHandledIds.add(pin.id));

    if (shouldShowSpotClusters(zoom)) {
      buildMemoryClusterMarker(
        L,
        map,
        layer,
        group,
        suppressClickRef,
        SPOT_CLUSTER_MAX_ZOOM + 1,
      );
      continue;
    }

    const center = clusterCentroid(group);
    group.forEach((pin, index) => {
      const ll = spreadPinPosition(center, index, group.length);
      buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef, ll);
    });
  }

  allPins
    .filter(pin => !spotHandledIds.has(pin.id))
    .forEach(pin => buildMemoryMarker(L, layer, pin, suppressClickRef, selectMemoryRef));
}

export function buildEventMarker(L, map, pin, { onLocationClick } = {}) {
  const size = EVENT_PIN_SIZE;
  const icon = L.divIcon({
    className: 'pin-event-marker',
    html: eventPinHtml(pin),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
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
