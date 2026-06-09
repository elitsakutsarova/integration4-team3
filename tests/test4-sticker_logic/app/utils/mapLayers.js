/** Basemap layer helpers for Leaflet */

export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const OPENFREEMAP_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function createOsmLayer(L) {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
  });
}

export function createOpenFreeMapLayer(L) {
  return L.maplibreGL({
    style: OPENFREEMAP_STYLE,
  });
}

export function addBasemapControl(L, map, { defaultLayer = 'openfreemap' } = {}) {
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
