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
  // raster map tiles
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
