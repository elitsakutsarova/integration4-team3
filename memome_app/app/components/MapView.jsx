// orchestration layer -> connects React with the Leaflet map engine

import '../styles/modules/new-memo.css';
import '../styles/modules/sticker-reveal.css';
import '../styles/modules/auth.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate, useRevalidator, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useCollectedStickersActions } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import NewMemoForm from './NewMemoForm';
import MemoLocationPicker from './MemoLocationPicker';
import MapHomeChrome from './MapHomeChrome';
import MapGuestCta from './MapGuestCta';
import GuestAddMemoLocked from './GuestAddMemoLocked';
import BottomNav from './BottomNav';
import MemorySheet from './MemorySheet';
import StickerRevealSheet from './StickerRevealSheet';
import MemoPostSuccess from './MemoPostSuccess';

import { MOCK_MEMORIES, INITIAL_EVENTS } from '../data/mockUser';
import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';

import { readAddMemoReturnTo } from '../utils/appPaths';
import { readDraftMemo } from '../utils/memoDraft';
import {
  clearNewMemoDraft,
  loadNewMemoDraft,
  memoDraftSearchParamsToUrl,
} from '../utils/newMemoDraftStore';
import { ANTWERP_BOUNDS_LEAFLET, createCustomPlace } from '../utils/locationHelpers';
import { filterMapEvents, filterMapMemories } from '../utils/mapFilters';
import { addBasemapControl } from '../utils/mapLayers';
import { syncMapStickerSymbols } from '../utils/mapStickerSymbols';
import { fetchLocationHrefFromApi } from '../utils/locationHrefClient';
import { useMemoLocationHref } from '../hooks/useMemoLocationHref';
import { pinHasMedia, readMediaDimensions } from '../utils/memoPinAssets';
import {
  buildEventMarker,
  placePendingPin,
  syncMemoryLayers,
} from '../utils/mapPins';
import { clearStickerReveal, readStickerReveal } from '../utils/stickerReveal';
import { journalAssets } from '../utils/journalAssets';

const DEMO_MEMORIES = [...MOCK_MEMORIES, ...GROTE_MARKT_CLUSTER_MEMORIES];

const ANTWERP_CENTER = [51.2194, 4.4025];
const ANTWERP_BOUNDS = ANTWERP_BOUNDS_LEAFLET;
const POSTED_MEMO_FOCUS_ZOOM = 15;

function getMemoLatLng(memo) {
  if (Array.isArray(memo?.ll) && memo.ll.length >= 2) {
    const lat = Number(memo.ll[0]);
    const lng = Number(memo.ll[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }

  const lat = Number(memo?.lat);
  const lng = Number(memo?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];

  return null;
}

function focusMapOnMemo(map, memo) {
  const latlng = getMemoLatLng(memo);
  if (!map || !latlng) return;

  const targetZoom = Math.max(map.getZoom(), POSTED_MEMO_FOCUS_ZOOM);
  map.invalidateSize();

  if (typeof map.flyTo === 'function') {
    map.flyTo(latlng, targetZoom, { duration: 0.85 });
    return;
  }

  map.setView(latlng, targetZoom, { animate: true });
}

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
  const guestAddMemoParam = searchParams.get('guestAddMemo') === '1';
  const fetcher = useFetcher({ key: 'create-memo' });
  const revalidator = useRevalidator();
  const { user } = useAuth();
  const { dismissSavedNotice } = useSavedMemos();
  const { addCollectedSticker } = useCollectedStickersActions();
  const { prependCreatedMemo } = useCreatedMemos();
  const handledPublishRef = useRef(false);
  const sawPublishSubmitRef = useRef(false);
  const initTokenRef = useRef(0);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const pendingMarkerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const memoryPinsRef = useRef(mergeMapMemories(savedMemos));
  const memoryLayerRef = useRef(null);
  const eventMarkersRef = useRef([]);
  const stickerSymbolLayerRef = useRef(null);
  const pendingMemoRef = useRef(null);
  const postedMemoPendingFocusRef = useRef(null);
  // Holds the latest layer-sync fn so Leaflet zoomend handlers never capture a stale closure.
  const refreshMemoryLayersRef = useRef(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const isGuestRef = useRef(false);
  isGuestRef.current = !user;

  const promptGuestAddMemoRef = useRef(null);
  promptGuestAddMemoRef.current = () => setGuestAddMemoLocked(true);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const selectedMemoryLocationHref = useMemoLocationHref(selectedMemory);
  const ignoreMemoScrimClickRef = useRef(false);
  const [revealedSticker, setRevealedSticker] = useState(null);
  const [guestAddMemoLocked, setGuestAddMemoLocked] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const showGuestAddMemoLocked = guestAddMemoLocked || (!user && (draftMemo || guestAddMemoParam));
  const hideBottomNav = Boolean((draftMemo && user) || showGuestAddMemoLocked);
  const [activeCategory, setActiveCategory] = useState('All');
  const [eventLocationHrefs, setEventLocationHrefs] = useState({});
  const [mapReady, setMapReady] = useState(false);
  const [guestCtaRetracted, setGuestCtaRetracted] = useState(false);
  const guestCtaIdleRef = useRef(null);
  const eventHrefsFetchRef = useRef(false);

  const filterOptions = { category: activeCategory, query: '' };

  const draftRestoredRef = useRef(false);

  // Re-open the add-memo form after refresh when URL params were lost but draft was saved.
  useEffect(() => {
    if (!user?.id || draftRestoredRef.current) return;
    if (readDraftMemo(searchParams)) return;

    const saved = loadNewMemoDraft(user.id);
    const params = memoDraftSearchParamsToUrl(saved?.searchParams);
    if (!params) return;

    draftRestoredRef.current = true;
    setSearchParams(params, { replace: true });
  }, [user?.id, searchParams, setSearchParams]);

  const savedMemosRef = useRef(savedMemos);
  savedMemosRef.current = savedMemos;

  const filterOptionsRef = useRef(filterOptions);
  filterOptionsRef.current = filterOptions;

  // Live refs: Leaflet registers event handlers once at init — these always point at the
  // current navigate/setState logic without re-binding listeners on every render.
  const openFormRef = useRef(null);
  openFormRef.current = (latlng) => {
    if (isGuestRef.current) {
      promptGuestAddMemoRef.current?.();
      return;
    }
    const place = createCustomPlace(latlng.lat, latlng.lng);
    setSearchParams({
      lat: String(place.lat),
      lng: String(place.lng),
      pinLat: String(place.lat),
      pinLng: String(place.lng),
      locationName: place.name,
    }, { replace: true });
  };

  const selectMemoryRef = useRef(null);
  selectMemoryRef.current = (pin) => {
    dismissSavedNotice();
    setSelectedMemory(pin);
    if (isGuestRef.current) {
      retractGuestCtaRef.current?.();
      restoreGuestCtaRef.current?.();
    }
  };

  const closeMemoryRef = useRef(null);
  closeMemoryRef.current = () => {
    dismissSavedNotice();
    setSelectedMemory(null);
  };

  function closeSelectedMemory() {
    closeMemoryRef.current?.();
  }

  const retractGuestCtaRef = useRef(null);
  retractGuestCtaRef.current = () => {
    window.clearTimeout(guestCtaIdleRef.current);
    setGuestCtaRetracted(true);
  };

  const restoreGuestCtaRef = useRef(null);
  restoreGuestCtaRef.current = () => {
    window.clearTimeout(guestCtaIdleRef.current);
    guestCtaIdleRef.current = window.setTimeout(() => {
      setGuestCtaRetracted(false);
    }, 1000);
  };

  useEffect(() => {
    if (user) setGuestCtaRetracted(false);
  }, [user]);

  useEffect(() => {
    if (!active || !mapReady || user) return undefined;

    const map = mapRef.current;
    if (!map) return undefined;

    const onInteractionStart = () => retractGuestCtaRef.current?.();
    const onInteractionEnd = () => restoreGuestCtaRef.current?.();
    const onMapClick = () => {
      onInteractionStart();
      onInteractionEnd();
    };

    map.on('movestart', onInteractionStart);
    map.on('moveend', onInteractionEnd);
    map.on('zoomstart', onInteractionStart);
    map.on('zoomend', onInteractionEnd);
    map.on('click', onMapClick);

    return () => {
      map.off('movestart', onInteractionStart);
      map.off('moveend', onInteractionEnd);
      map.off('zoomstart', onInteractionStart);
      map.off('zoomend', onInteractionEnd);
      map.off('click', onMapClick);
      window.clearTimeout(guestCtaIdleRef.current);
    };
  }, [active, mapReady, user]);

  useEffect(() => {
    if (!selectedMemory) return undefined;
    ignoreMemoScrimClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreMemoScrimClickRef.current = false;
    }, 450);
    return () => window.clearTimeout(timer);
  }, [selectedMemory?.id]);

  useEffect(() => {
    const mediaUrl = selectedMemory?.mediaPreview?.url;
    if (!mediaUrl || selectedMemory.mediaPreview?.isVideo) return undefined;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = mediaUrl;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [selectedMemory?.id, selectedMemory?.mediaPreview?.url, selectedMemory?.mediaPreview?.isVideo]);

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
  const filterFingerprint = `${memoFingerprint}|${activeCategory}`;

  useEffect(() => {
    if (!active || !mapReady) return undefined;

    let cancelled = false;
    const mediaPins = memoryPinsRef.current
      .filter(pin => pinHasMedia(pin))
      .filter(pin => !pin.mediaPreview?.width || !pin.mediaPreview?.height)
      .slice(0, 12);

    for (const pin of mediaPins) {
      void readMediaDimensions(pin.mediaPreview.url, {
        isVideo: Boolean(pin.mediaPreview.isVideo),
      }).then(({ width, height }) => {
        if (cancelled || !width || !height) return;
        pin.mediaPreview.width = width;
        pin.mediaPreview.height = height;
        syncMapPins();
      });
    }

    return () => {
      cancelled = true;
    };
  }, [active, mapReady, filterFingerprint, syncMapPins]);

  // Leaving home: reset map UI and URL params. Entering: restore sticker reveal + fix map size.
  useEffect(() => {
    if (!active) {
      setSelectedMemory(null);
      setGuestAddMemoLocked(false);
      setSearchParams({}, { replace: true });
      return;
    }

    const pendingReveal = readStickerReveal();
    if (pendingReveal) {
      setRevealedSticker(pendingReveal);
      addCollectedSticker(pendingReveal);
      revalidator.revalidate();
    }

    const map = mapRef.current;
    if (!map) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [active, setSearchParams, revalidator, addCollectedSticker]);

  function dismissStickerReveal() {
    clearStickerReveal();
    setRevealedSticker(null);
  }

  // Drop optimistic pin once the server list includes the newly created memo.
  useEffect(() => {
    if (!pendingMemoRef.current) return;
    if (savedMemos.some(m => m.id === pendingMemoRef.current.id)) {
      pendingMemoRef.current = null;
    }
  }, [savedMemos, memoFingerprint]);

  // Resolve navigable location links for map event popups (once per map session).
  useEffect(() => {
    if (!active || eventHrefsFetchRef.current) return;
    eventHrefsFetchRef.current = true;

    let cancelled = false;
    Promise.all(
      INITIAL_EVENTS.filter(pin => pin.placeId && Array.isArray(pin.ll)).map(async (pin) => {
        const href = await fetchLocationHrefFromApi({
          placeId: pin.placeId,
          lat: pin.ll[0],
          lng: pin.ll[1],
          name: pin.label,
        });
        return [pin.id, href];
      }),
    ).then((pairs) => {
      if (cancelled) return;
      setEventLocationHrefs(Object.fromEntries(pairs.filter(([, href]) => href)));
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  // Rebuild Leaflet event markers when category filter, href data, or map readiness changes.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !mapReady) return;

    for (const marker of eventMarkersRef.current) {
      marker.remove();
    }

    const visibleEvents = filterMapEvents(INITIAL_EVENTS, filterOptions);
    eventMarkersRef.current = visibleEvents.map(pin => {
      if (!Array.isArray(pin.ll) || pin.ll.some(n => !Number.isFinite(n))) return null;
      return buildEventMarker(L, map, {
        ...pin,
        locationHref: eventLocationHrefs[pin.id] ?? null,
      }, {
        onLocationClick: locationHref => {
          if (locationHref) navigateRef.current(locationHref);
        },
      });
    }).filter(Boolean);
  }, [active, activeCategory, eventLocationHrefs, mapReady]);

  // Refresh memory pin clusters after revalidation or filter changes.
  useEffect(() => {
    if (revalidator.state !== 'idle') return;
    syncMapPins();
  }, [revalidator.state, filterFingerprint, syncMapPins]);

  const mapContainerRef = useRef(null);

  const attachMapContainer = useCallback((node) => {
    mapContainerRef.current = node;
    if (!node) {
      initTokenRef.current += 1;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        leafletRef.current = null;
        pendingMarkerRef.current = null;
        memoryLayerRef.current = null;
        stickerSymbolLayerRef.current = null;
        refreshMemoryLayersRef.current = null;
      }
      return;
    }
  }, []);

  // Create the Leaflet map once when the home tab becomes active.
  useEffect(() => {
    if (!active) return;

    const node = mapContainerRef.current;
    if (!node || mapRef.current) return;

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
      syncMapStickerSymbols(L, map, stickerSymbolLayerRef, suppressClickRef);
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

      map.on('click', e => {
        if (suppressClickRef.current) return;
        if (!e.latlng || !Number.isFinite(e.latlng.lat) || !Number.isFinite(e.latlng.lng)) return;
        if (isGuestRef.current) {
          closeMemoryRef.current?.();
          return;
        }
        placePendingPin(L, map, e.latlng, pendingMarkerRef, suppressClickRef, openFormRef);
        openFormRef.current(e.latlng);
      });

      requestAnimationFrame(() => map.invalidateSize());
      if (token === initTokenRef.current) {
        setMapReady(true);
      }
    }

    void init().catch((err) => {
      console.warn('[MemMe] Map init failed.', err?.message ?? err);
    });
  }, [active]);

  // Remove the draft pin when the add-memo form is closed.
  useEffect(() => {
    if (draftMemo) return;
    if (!pendingMarkerRef.current) return;
    pendingMarkerRef.current.remove();
    pendingMarkerRef.current = null;
  }, [draftMemo]);

  // Place a pending pin and center the map when add-memo URL params are present.
  useEffect(() => {
    if (!active || !draftMemo || !user) return;

    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const latlng = { lat: draftMemo.pinLat, lng: draftMemo.pinLng };
    placePendingPin(L, map, latlng, pendingMarkerRef, suppressClickRef, openFormRef);
    map.setView([latlng.lat, latlng.lng], Math.max(map.getZoom(), 13), { animate: false });
  }, [active, draftMemo?.lat, draftMemo?.lng, draftMemo?.pinLat, draftMemo?.pinLng]);

  // After create-memo fetcher succeeds: update pins, clear URL, show success modal.
  useEffect(() => {
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      sawPublishSubmitRef.current = true;
      handledPublishRef.current = false;
      return;
    }
    if (fetcher.state !== 'idle' || handledPublishRef.current) return;
    if (!sawPublishSubmitRef.current) return;
    sawPublishSubmitRef.current = false;

    if (fetcher.data?.success) {
      handledPublishRef.current = true;

      const memo = fetcher.data.memo;
      const draftCoords = draftMemo ? [draftMemo.lat, draftMemo.lng] : null;
      const latlng = getMemoLatLng(memo) ?? draftCoords;
      const focusMemo = latlng ? { ...(memo ?? {}), ll: latlng } : memo ?? null;

      if (focusMemo) {
        pendingMemoRef.current = focusMemo;
        postedMemoPendingFocusRef.current = focusMemo;
        prependCreatedMemo(focusMemo);
        syncMapPins();
      }

      clearNewMemoDraft(user?.id);
      setSearchParams({}, { replace: true });
      setShowPublishSuccess(true);
    }
  }, [fetcher.state, fetcher.data, draftMemo, setSearchParams, syncMapPins, prependCreatedMemo, user?.id]);

  useEffect(() => {
    if (showPublishSuccess) return undefined;

    const memo = postedMemoPendingFocusRef.current;
    if (!memo) return undefined;

    postedMemoPendingFocusRef.current = null;

    filterOptionsRef.current = { category: 'All', query: '' };
    setActiveCategory('All');

    const timer = window.setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      syncMapPins();
      focusMapOnMemo(map, memo);
      selectMemoryRef.current?.(memo);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [showPublishSuccess, syncMapPins]);

  function handlePublishSuccessClose() {
    setShowPublishSuccess(false);
  }

  function handleAddBtnClick() {
    if (isGuestRef.current) {
      promptGuestAddMemoRef.current?.();
      return;
    }

    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const center = map.getCenter();
    placePendingPin(L, map, center, pendingMarkerRef, suppressClickRef, openFormRef);
    openFormRef.current(center);
  }

  function exitAddMemoFlow() {
    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    clearNewMemoDraft(user?.id);

    const returnTo = readAddMemoReturnTo(searchParams);
    if (returnTo) {
      navigate(returnTo, { replace: true });
      return;
    }

    setSearchParams({}, { replace: true });
  }

  function dismissGuestAddMemoLocked() {
    setGuestAddMemoLocked(false);
    exitAddMemoFlow();
  }

  // Leaflet must recalculate size when overlays change the visible map area.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [active, guestAddMemoLocked, draftMemo]);

  function handleFormClose() {
    exitAddMemoFlow();
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
    <div
      className={[
        'map-page',
        active ? '' : 'map-page--inactive',
        selectedMemory ? 'map-page--memo-open' : '',
        showGuestAddMemoLocked ? 'map-page--side-panel' : '',
        draftMemo && user && !draftMemo.pickLocation ? 'map-page--side-panel' : '',
      ].filter(Boolean).join(' ')}
    >
      <div ref={attachMapContainer} className="map-container" />

      {active && (
        <>
          <MapHomeChrome
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <div className="map-container--bottom">
            {!user && !revealedSticker && !draftMemo && !selectedMemory && !showGuestAddMemoLocked && (
              <MapGuestCta retracted={guestCtaRetracted} />
            )}

            {!hideBottomNav && <BottomNav onAddClick={handleAddBtnClick} />}
          </div>
          <button
            type="button"
            className="map-desktop-add"
            onClick={handleAddBtnClick}
            aria-label="Add memo"
          >
            <img
              className="map-desktop-add-icon"
              src={journalAssets.addMenu}
              alt="Add memo menu icon"
              aria-hidden="true"
            />
          </button>

          {showGuestAddMemoLocked && (
            <GuestAddMemoLocked onClose={dismissGuestAddMemoLocked} />
          )}

          {selectedMemory && (
            <button
              type="button"
              className="memory-sheet-scrim"
              aria-label="Close memo"
              onClick={() => {
                if (ignoreMemoScrimClickRef.current) return;
                closeSelectedMemory();
              }}
            />
          )}

          {selectedMemory && (
            <MemorySheet
              key={selectedMemory.id}
              pin={selectedMemory}
              locationHref={selectedMemoryLocationHref}
              onClose={closeSelectedMemory}
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

          {draftMemo && user && (
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

          {showPublishSuccess && (
            <MemoPostSuccess onClose={() => setShowPublishSuccess(false)} />
          )}
        </>
      )}
    </div>
  );
}
