// a Leaflet basemap manager
// lets the map switch between different map tile providers (OpenStreetMap vs OpenFreeMap) and handle fallbacks safely

//defines how OpenFreeMap looks (colors, roads, typography)
export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const OPENFREEMAP_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// OpenStreetMap layer
export function createOsmLayer(L) {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
  });
}

// OpenFreeMap layer (vector style) -> uses Maplibre GL to render vector tiles
export function createOpenFreeMapLayer(L) {
  return L.maplibreGL({
    style: OPENFREEMAP_STYLE,
  });
}

/** OpenFreeMap styles reference POI icons missing from their sprite sheet. */
function attachMissingStyleImageFallback(glMap) {
  if (!glMap || glMap.__memmeMissingImagePatch) return;
  glMap.__memmeMissingImagePatch = true;

  const transparentPixel = new Uint8Array(4);
  const placeholder = { width: 1, height: 1, data: transparentPixel };

  const addPlaceholder = id => {
    if (!id || glMap.hasImage(id)) return;
    glMap.addImage(id, placeholder);
  };

  glMap.on('styleimagemissing', ({ id }) => addPlaceholder(id));

  const preloadKnownMissing = () => {
    for (const id of OPENFREEMAP_MISSING_SPRITE_IDS) addPlaceholder(id);
  };

  if (glMap.isStyleLoaded?.()) preloadKnownMissing();
  else glMap.once('load', preloadKnownMissing);
}

const OPENFREEMAP_MISSING_SPRITE_IDS = [
  'gate',
  'recycling',
  'brownfield',
  'ferry_terminal',
  'sailing',
  'toll_booth',
];

const WEBGL_CONTEXT_ATTRS = {
  antialias: false,
  alpha: true,
  depth: true,
  stencil: true,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
  failIfMajorPerformanceCaveat: false,
};

/** OpenFreeMap/MapLibre needs WebGL; skip vector tiles when the browser blocks it. */
export function isWebGLAvailable() {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', WEBGL_CONTEXT_ATTRS)
      ?? canvas.getContext('webgl', WEBGL_CONTEXT_ATTRS)
      ?? canvas.getContext('experimental-webgl', WEBGL_CONTEXT_ATTRS);

    if (!gl) return false;

    const vendor = gl.getParameter(gl.VENDOR);
    const renderer = gl.getParameter(gl.RENDERER);
    if (vendor === 0xffff || renderer === 0xffff) return false;
    if (String(renderer).toLowerCase().includes('disabled')) return false;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const unmasked = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (String(unmasked).toLowerCase().includes('disabled')) return false;
    }

    return true;
  } catch {
    return false;
  }
}

function fallbackToOsmBasemap(map, openFreeMap, osm) {
  if (openFreeMap && map.hasLayer(openFreeMap)) {
    map.removeLayer(openFreeMap);
  }
  if (!map.hasLayer(osm)) {
    osm.addTo(map);
  }
}

function attachOpenFreeMapFallback(map, openFreeMap, osm) {
  const fallback = () => fallbackToOsmBasemap(map, openFreeMap, osm);

  openFreeMap.on?.('error', fallback);
  openFreeMap.on?.('add', () => {
    const glMap = openFreeMap.getMaplibreMap?.();
    if (!glMap) {
      fallback();
      return;
    }
    attachMissingStyleImageFallback(glMap);
    glMap.on('error', fallback);
  });
}

/** Remove leftover pin hosts from earlier map init (pane reparenting broke Leaflet clicks). */
export function removeStaleMapPinHosts(root) {
  root?.querySelectorAll('.map-pins-above-tint').forEach(el => el.remove());
}

// L -> Leaflet instance, map -> actual map object, defaultLayer -> which map starts first
export function addBasemapControl(L, map, { defaultLayer = 'openfreemap' } = {}) {
  // fallback layer
  const osm = createOsmLayer(L);
  let openFreeMap = null;

  if (isWebGLAvailable()) {
    try {
      openFreeMap = createOpenFreeMapLayer(L);
    } catch (err) {
      console.warn('[MemMe] OpenFreeMap layer unavailable, using OSM.', err?.message);
    }
  } else {
    console.warn('[MemMe] WebGL unavailable, using OSM basemap.');
  }

  const baseLayers = { OpenStreetMap: osm };
  if (openFreeMap) baseLayers.OpenFreeMap = openFreeMap;

  const activeLayer =
    defaultLayer === 'osm' || !openFreeMap ? osm : openFreeMap;

  if (openFreeMap) {
    attachOpenFreeMapFallback(map, openFreeMap, osm);
  }

  activeLayer.addTo(map);

  L.control
    .layers(baseLayers, null, {
      position: 'topleft',
      collapsed: true,
    })
    .addTo(map);

  return { osm, openFreeMap };
}
