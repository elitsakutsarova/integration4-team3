// orchestration layer -> connects React with the Leaflet map engine

import '../styles/modules/new-memo.css';
import '../styles/modules/sticker-reveal.css';
import '../styles/modules/auth.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher, useLocation, useNavigate, useRevalidator, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useSavedMemos } from '../context/SavedMemosContext';
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

import { paths, readAddMemoReturnTo } from '../utils/appPaths';
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
import { useFetcherSubmitSuccess } from '../hooks/useFetcherSubmitSuccess';
import { pinHasMedia, readMediaDimensions } from '../utils/memoPinAssets';
import {
  buildEventMarker,
  placePendingPin,
  syncMemoryLayers,
} from '../utils/mapPins';
import { useCollectedStickersActions } from '../context/CollectedStickersContext';
import { clearStickerReveal, readStickerReveal } from '../utils/stickerReveal';
import { journalAssets } from '../utils/journalAssets';
import {
  MAP_DESKTOP_BREAKPOINT,
  getMapPinAnchorPoint,
  isDesktopMapLayout,
} from '../utils/mapMemoryAnchor';

const DEMO_MEMORIES = [...MOCK_MEMORIES, ...GROTE_MARKT_CLUSTER_MEMORIES];

const ANTWERP_CENTER = [51.2194, 4.4025];
const ANTWERP_BOUNDS = ANTWERP_BOUNDS_LEAFLET;
const POSTED_MEMO_FOCUS_ZOOM = 15;

function getMapPinLatLng(pin) {
  if (Array.isArray(pin?.ll) && pin.ll.length >= 2) {
    const lat = Number(pin.ll[0]);
    const lng = Number(pin.ll[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }

  const lat = Number(pin?.lat);
  const lng = Number(pin?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];

  return null;
}

function focusMapOnPin(map, pin) {
  const latlng = getMapPinLatLng(pin);
  if (!map || !latlng) return;

  const targetZoom = Math.max(map.getZoom(), POSTED_MEMO_FOCUS_ZOOM);
  map.invalidateSize();

  if (typeof map.flyTo === 'function') {
    map.flyTo(latlng, targetZoom, { duration: 0.85 });
    return;
  }

  map.setView(latlng, targetZoom, { animate: true });
}

function focusMapOnMemo(map, memo) {
  focusMapOnPin(map, memo);
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
  const { pathname } = useLocation();
  const isHomeRoute = pathname === paths.home;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const draftMemo = readDraftMemo(searchParams);
  const guestAddMemoParam = searchParams.get('guestAddMemo') === '1';
  const fetcher = useFetcher({ key: 'create-memo' });
  const revalidator = useRevalidator();
  const { user } = useAuth();
  const { dismissSavedNotice } = useSavedMemos();
  const { prependCreatedMemo } = useCreatedMemos();
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
  const [memoryAnchor, setMemoryAnchor] = useState(null);
  const selectedMemoryRef = useRef(null);
  selectedMemoryRef.current = selectedMemory;
  const [isDesktopMap, setIsDesktopMap] = useState(() => isDesktopMapLayout());
  const selectedMemoryLocationHref = useMemoLocationHref(selectedMemory);
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

  const draftMemoRef = useRef(draftMemo);
  draftMemoRef.current = draftMemo;

  const exitAddMemoFlowRef = useRef(null);

  const selectMemoryRef = useRef(null);
  selectMemoryRef.current = (pin) => {
    if (selectedMemoryRef.current?.id === pin?.id) {
      closeMemoryRef.current?.();
      return;
    }

    if (isDesktopMapLayout() && draftMemoRef.current) {
      exitAddMemoFlowRef.current?.({ skipReturnTo: true });
    }

    dismissSavedNotice();
    const map = mapRef.current;
    if (map) {
      focusMapOnMemo(map, pin);
    }
    setMemoryAnchor(getMapPinAnchorPoint(map, pin));
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
    setMemoryAnchor(null);
  };

  const focusEventPinRef = useRef(null);
  focusEventPinRef.current = (pin) => {
    if (!isDesktopMapLayout()) return;
    focusMapOnPin(mapRef.current, pin);
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
    const mediaQuery = window.matchMedia(MAP_DESKTOP_BREAKPOINT);
    const update = () => setIsDesktopMap(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

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

  useEffect(() => {
    if (!active || !selectedMemory) return undefined;

    const map = mapRef.current;
    if (!map || !Array.isArray(selectedMemory.ll) || selectedMemory.ll.length < 2) return undefined;

    function updateAnchor() {
      setMemoryAnchor(getMapPinAnchorPoint(map, selectedMemory));
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

  const { addCollectedSticker } = useCollectedStickersActions();

  // Leaving home: reset map UI and URL params. Entering: restore sticker reveal + fix map size.
  useEffect(() => {
    if (!active) {
      setSelectedMemory(null);
      setMemoryAnchor(null);
      setGuestAddMemoLocked(false);
      setSearchParams({}, { replace: true });
      return;
    }

    const pendingReveal = readStickerReveal();
    if (pendingReveal) {
      addCollectedSticker(pendingReveal);
      setRevealedSticker(pendingReveal);
    }

    const map = mapRef.current;
    if (!map) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [active, addCollectedSticker, setSearchParams]);

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
        onPinClick: pin => focusEventPinRef.current?.(pin),
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
          onPinClick: eventPin => focusEventPinRef.current?.(eventPin),
        });
      }).filter(Boolean);

      map.on('click', e => {
        if (suppressClickRef.current) return;
        if (!e.latlng || !Number.isFinite(e.latlng.lat) || !Number.isFinite(e.latlng.lng)) return;
        if (selectedMemoryRef.current) {
          closeMemoryRef.current?.();
          return;
        }
        if (isGuestRef.current) return;
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
    if (!Number.isFinite(draftMemo.pinLat) || !Number.isFinite(draftMemo.pinLng)) return;

    const latlng = { lat: draftMemo.pinLat, lng: draftMemo.pinLng };
    placePendingPin(L, map, latlng, pendingMarkerRef, suppressClickRef, openFormRef);
    map.setView([latlng.lat, latlng.lng], Math.max(map.getZoom(), 13), { animate: false });
  }, [active, draftMemo?.lat, draftMemo?.lng, draftMemo?.pinLat, draftMemo?.pinLng]);

  const handleCreateMemoSuccess = useCallback((data) => {
    const memo = data.memo;
    const draftCoords = draftMemo ? [draftMemo.lat, draftMemo.lng] : null;
    const latlng = getMapPinLatLng(memo) ?? draftCoords;
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
  }, [draftMemo, prependCreatedMemo, setSearchParams, syncMapPins, user?.id]);

  useFetcherSubmitSuccess(fetcher, {
    when: (data) => Boolean(data?.success),
    onSuccess: handleCreateMemoSuccess,
  });

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
      selectMemoryRef.current?.(memo);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [showPublishSuccess, syncMapPins]);

  function handlePublishSuccessClose() {
    setShowPublishSuccess(false);
  }

  function handleAddBtnClick() {
    closeSelectedMemory();

    if (isGuestRef.current) {
      promptGuestAddMemoRef.current?.();
      return;
    }

    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    setSearchParams({ addMemo: '1' }, { replace: true });
  }

  function exitAddMemoFlow({ skipReturnTo = false } = {}) {
    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    clearNewMemoDraft(user?.id);

    const returnTo = skipReturnTo ? null : readAddMemoReturnTo(searchParams);
    if (returnTo) {
      navigate(returnTo, { replace: true });
      return;
    }

    setSearchParams({}, { replace: true });
  }

  exitAddMemoFlowRef.current = exitAddMemoFlow;

  function dismissGuestAddMemoLocked() {
    setGuestAddMemoLocked(false);
    exitAddMemoFlow();
  }

  const showAddMemoInDiscoverPanel = Boolean(
    isDesktopMap && draftMemo && user && !draftMemo.pickLocation,
  );
  const showDesktopMemoFocus = Boolean(isDesktopMap && selectedMemory);

  useEffect(() => {
    const shell = document.querySelector('.main-shell');
    if (!shell) return undefined;

    shell.classList.toggle('main-shell--add-memo-panel', showAddMemoInDiscoverPanel);
    shell.classList.toggle('main-shell--memo-selected', showDesktopMemoFocus);

    return () => {
      shell.classList.remove('main-shell--add-memo-panel', 'main-shell--memo-selected');
    };
  }, [showAddMemoInDiscoverPanel, showDesktopMemoFocus]);

  // Leaflet must recalculate size when overlays change the visible map area.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [active, guestAddMemoLocked, draftMemo, selectedMemory]);

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

      {active && isHomeRoute && (
        <>
          <MapHomeChrome
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchTo={isDesktopMap ? paths.discoverSearch : paths.search}
          />
          <div className="map-container--bottom">
            {!user && !revealedSticker && !draftMemo && !selectedMemory && !showGuestAddMemoLocked && (
              <MapGuestCta retracted={guestCtaRetracted} />
            )}

            {!hideBottomNav && <BottomNav onAddClick={handleAddBtnClick} />}
          </div>
        </>
      )}

      {active && (
        <>
          <button
            type="button"
            className="map-desktop-add"
            onClick={handleAddBtnClick}
            aria-label="Add memo"
          >
            <img
              className="map-desktop-add-icon"
              src={journalAssets.addMenuDesktop}
              alt=""
              aria-hidden="true"
            />
          </button>

          {showGuestAddMemoLocked && (
            <GuestAddMemoLocked onClose={dismissGuestAddMemoLocked} />
          )}

          {selectedMemory && !isDesktopMap && (
            <div className="memory-sheet-scrim" aria-hidden="true" />
          )}

          {selectedMemory && (
            <MemorySheet
              key={selectedMemory.id}
              pin={selectedMemory}
              anchor={memoryAnchor}
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
              discoverPanel={showAddMemoInDiscoverPanel}
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
