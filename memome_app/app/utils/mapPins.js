//turning our data (pins, clusters, events) into map markers with custom HTML interface

import { fetchLocationHrefFromApi } from './locationHrefClient';
import { isSafeMediaAssetUrl } from './validators';
import { discoverEventPath } from './appPaths';
import { applyMapPopupContentScale, getMapPopupScale } from './mapPopupScale';
import {
  EVENT_PIN_SIZE,
  applyPolaroidOrientationClass,
  buildMapPinMediaMarkup,
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
  if (isSafeMediaAssetUrl(url)) {
    return escapeHtml(url);
  }
  return '';
}

export function addPinHtml() {
  return `<div class="pin-memory-tag">
    <svg class="pin-memory-tag-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 267 375" aria-hidden="true">
      <path d="M133.286 0C213.258 0 266.572 53.5203 266.572 133.801C266.572 214.081 186.601 294.362 133.286 374.642C79.9717 294.362 0 214.081 0 133.801C0 53.5203 53.3145 0 133.286 0ZM133.286 66.9004C115.611 66.9004 98.6604 73.9488 86.1624 86.4951C73.6644 99.0413 66.6431 116.058 66.6431 133.801C66.6431 151.544 73.6644 168.56 86.1624 181.107C98.6604 193.653 115.611 200.701 133.286 200.701C150.961 200.701 167.912 193.653 180.41 181.107C192.908 168.56 199.929 151.544 199.929 133.801C199.929 116.058 192.908 99.0413 180.41 86.4951C167.912 73.9488 150.961 66.9004 133.286 66.9004Z" fill="#1952FF"/>
      <circle cx="133.287" cy="133.287" r="82.8536" fill="white"/>
      <path d="M133.287 104.5V162.074" stroke="#202020" stroke-width="14" stroke-linecap="round"/>
      <path d="M104.5 133.287H162.074" stroke="#202020" stroke-width="14" stroke-linecap="round"/>
    </svg>
  </div>`;
}

function tagPinHtml(pin) {
  const pinSvg = resolveMemoPinSvg(pin);
  return `<div class="pin-memory-tag">
    <img class="pin-memory-tag-svg" src="${escapeHtml(pinSvg)}" alt="Memory tag pin marker" />
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
  const mediaMarkup = buildMapPinMediaMarkup({
    url: mediaUrl,
    isVideo,
    orientation,
    className: 'pin-memory-polaroid-img',
    alt: pin.location ? `Memo photo from ${pin.location}` : 'Memo photo',
  });

  return `<div class="pin-memory-polaroid ${orientClass}">
    <div class="pin-memory-polaroid-frame">
      <div class="pin-memory-polaroid-photo">${mediaMarkup}</div>
    </div>
    <img class="pin-memory-polaroid-tag" src="${escapeHtml(pinSvg)}" alt="Memory pin tag" />
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
    <img class="pin-memory-cluster-svg" src="/memos/pin_random.svg" alt="Memory cluster pin marker" />
    <span class="pin-memory-cluster-count">${count}</span>
  </div>`;
}

export function eventPinHtml(pin) {
  const iconMarkup = eventCenterIconSvg(resolveEventIconTag(pin));
  return `<div class="pin-event">
    <img class="pin-event-rings" src="/memos/event_pin_rings.svg" alt="Event pin marker rings" />
    <div class="pin-event-core"><div class="pin-event-core-disc">${iconMarkup}</div></div>
  </div>`;
}

function eventLocationPinSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 19" fill="none" aria-hidden="true">
    <path d="M6.5625 0C2.93959 0 0 2.64592 0 5.90625C0 11.1562 6.5625 18.375 6.5625 18.375C6.5625 18.375 13.125 11.1562 13.125 5.90625C13.125 2.64592 10.1854 0 6.5625 0ZM6.5625 9.1875C6.04332 9.1875 5.53581 9.03355 5.10413 8.74511C4.67245 8.45667 4.336 8.0467 4.13732 7.56704C3.93864 7.08739 3.88665 6.55959 3.98794 6.05039C4.08922 5.54119 4.33923 5.07346 4.70634 4.70634C5.07346 4.33923 5.54119 4.08922 6.05039 3.98794C6.55959 3.88665 7.08739 3.93864 7.56704 4.13732C8.0467 4.336 8.45667 4.67245 8.74511 5.10413C9.03355 5.53581 9.1875 6.04332 9.1875 6.5625C9.18674 7.25846 8.90993 7.9257 8.41782 8.41782C7.9257 8.90993 7.25846 9.18674 6.5625 9.1875Z" fill="#9CA3AF"/>
  </svg>`;
}

function eventLiveBadgeSvg() {
  return `<svg class="event-popup-badge-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3 6.5C5.5 4 12.5 4 15 6.5" stroke="#202020" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M5.5 9C7 7.5 11 7.5 12.5 9" stroke="#202020" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="9" cy="12" r="1.25" fill="#202020"/>
  </svg>`;
}

export function eventPopupHtml(pin) {
  const tags = pin.tags.map(t => `<span class="event-tag">${escapeHtml(t)}</span>`).join('');
  const learnMoreHref = pin.discoverEventId
    ? discoverEventPath(pin.discoverEventId)
    : null;
  const learnMoreCta = learnMoreHref
    ? `<a class="event-popup-cta" href="${learnMoreHref}">Learn more</a>`
    : pin.learnMoreDisabled
      ? '<span class="event-popup-cta event-popup-cta--disabled" aria-disabled="true">Learn more</span>'
      : '';
  const locationHref = pin.locationHref ?? null;
  const locationLabel = locationHref
    ? `<a class="event-popup-location-link event-location-link" href="${escapeHtml(locationHref)}">${escapeHtml(pin.label)}</a>`
    : `<span class="event-popup-location-link event-popup-location-link--plain">${escapeHtml(pin.label)}</span>`;
  const badgeLabel = escapeHtml(pin.badge ?? 'Now');

  return `<div class="event-popup">
    <div class="event-popup-card">
      <h3 class="event-popup-title"><span class="event-popup-title-highlight">${escapeHtml(pin.title)}</span></h3>
      <div class="event-popup-tags">${tags}</div>
      <div class="event-popup-footer">
        <p class="event-popup-location">
          ${eventLocationPinSvg()}
          ${locationLabel}
        </p>
        ${learnMoreCta}
      </div>
    </div>
    <div class="event-popup-visual" aria-hidden="true">
      <div class="event-popup-visual-accent event-popup-visual-accent--back"></div>
      <div class="event-popup-image-frame">
        <img class="event-popup-image" src="${safeAssetUrl(pin.image)}" alt="${escapeHtml(pin.title)}" loading="lazy" decoding="async" />
      </div>
      <span class="event-popup-badge">${eventLiveBadgeSvg()} ${badgeLabel}</span>
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

function applyEventPopupScale(marker) {
  const wrapper = marker.getPopup()?.getElement()?.querySelector('.leaflet-popup-content-wrapper');
  applyMapPopupContentScale(wrapper, getMapPopupScale());
}

function bindEventPopupScaleListener(marker) {
  if (marker._popupScaleHandler) return;

  marker._popupScaleHandler = () => applyEventPopupScale(marker);
  window.addEventListener('resize', marker._popupScaleHandler);
}

function unbindEventPopupScaleListener(marker) {
  if (!marker._popupScaleHandler) return;
  window.removeEventListener('resize', marker._popupScaleHandler);
  marker._popupScaleHandler = null;
}

function wireEventPopupNavigation(L, marker, onNavigate) {
  if (!onNavigate) return;

  const root = marker.getPopup()?.getElement()?.querySelector('.event-popup');
  if (!root) return;

  if (marker._popupNavHandler) {
    L.DomEvent.off(root, 'click', marker._popupNavHandler);
  }

  L.DomEvent.disableClickPropagation(root);
  marker._popupNavHandler = (event) => {
    const link = event.target.closest('a.event-popup-location-link, a.event-popup-cta, a.event-location-link');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    L.DomEvent.stopPropagation(event);
    event.preventDefault();
    marker.closePopup();
    onNavigate(href);
  };
  L.DomEvent.on(root, 'click', marker._popupNavHandler);
}

async function resolveEventPopupPin(pin) {
  if (pin.locationHref || !pin.placeId || !Array.isArray(pin.ll)) return pin;

  const locationHref = await fetchLocationHrefFromApi({
    placeId: pin.placeId,
    lat: pin.ll[0],
    lng: pin.ll[1],
    name: pin.label,
  });

  return locationHref ? { ...pin, locationHref } : pin;
}

export function buildEventMarker(L, map, pin, { onLocationClick, onPinClick } = {}) {
  const size = EVENT_PIN_SIZE;
  const icon = L.divIcon({
    className: 'pin-event-marker',
    html: eventPinHtml(pin),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [132, -54],
  });
  const marker = L.marker(pin.ll, { icon }).addTo(map);
  marker.bindPopup(eventPopupHtml(pin), {
    className: 'event-popup-wrapper',
    maxWidth: 265,
    minWidth: 265,
    closeButton: true,
  });

  if (onPinClick) {
    marker.on('click', () => {
      onPinClick(pin);
    });
  }

  marker.on('popupopen', () => {
    applyEventPopupScale(marker);
    bindEventPopupScaleListener(marker);

    void (async () => {
      const resolvedPin = await resolveEventPopupPin(pin);
      const popup = marker.getPopup();
      if (!popup) return;

      popup.setContent(eventPopupHtml(resolvedPin));
      wireEventPopupNavigation(L, marker, onLocationClick);
      applyEventPopupScale(marker);
    })();
  });

  marker.on('popupclose', () => {
    unbindEventPopupScaleListener(marker);
  });

  return marker;
}

export function placePendingPin(L, map, latlng, pendingMarkerRef, suppressClickRef, openFormRef) {
  if (pendingMarkerRef.current) {
    pendingMarkerRef.current.remove();
    pendingMarkerRef.current = null;
  }
  const icon = L.divIcon({
    className: 'pin-memory-marker',
    html: addPinHtml(),
    iconSize: [TAG_PIN_WIDTH, TAG_PIN_HEIGHT],
    iconAnchor: [TAG_PIN_WIDTH / 2, TAG_PIN_HEIGHT],
  });
  const marker = L.marker(latlng, { icon }).addTo(map);
  marker.on('click', (event) => {
    L.DomEvent.stopPropagation(event);
    suppressNextMapClick(suppressClickRef);
    openFormRef.current(latlng);
  });
  pendingMarkerRef.current = marker;
}
