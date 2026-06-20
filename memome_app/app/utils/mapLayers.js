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
  const layer = L.maplibreGL({
    style: OPENFREEMAP_STYLE,
  });

  layer.on('add', () => {
    attachMissingStyleImageFallback(layer.getMaplibreMap?.());
  });

  return layer;
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

/** Remove leftover pin hosts from earlier map init (pane reparenting broke Leaflet clicks). */
export function removeStaleMapPinHosts(root) {
  root?.querySelectorAll('.map-pins-above-tint').forEach(el => el.remove());
}

// L -> Leaflet instance, map -> actual map object, defaultLayer -> which map starts first
export function addBasemapControl(L, map, { defaultLayer = 'openfreemap' } = {}) {
  // fallback layer
  const osm = createOsmLayer(L);
  let openFreeMap = null;

  try {
    openFreeMap = createOpenFreeMapLayer(L);
  } catch (err) {
    console.warn('[MemMe] OpenFreeMap layer unavailable, using OSM.', err?.message);
  }

  const baseLayers = { OpenStreetMap: osm };
  if (openFreeMap) baseLayers.OpenFreeMap = openFreeMap;

  const activeLayer =
    defaultLayer === 'osm' || !openFreeMap ? osm : openFreeMap;
  activeLayer.addTo(map);

  if (openFreeMap) {
    openFreeMap.on?.('error', () => {
      if (map.hasLayer(openFreeMap)) {
        map.removeLayer(openFreeMap);
        if (!map.hasLayer(osm)) osm.addTo(map);
      }
    });
  }

  L.control
    .layers(baseLayers, null, {
      position: 'topleft',
      collapsed: true,
    })
    .addTo(map);

  return { osm, openFreeMap };
}
