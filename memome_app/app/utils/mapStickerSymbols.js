/** Decorative collectible sticker markers on the home map. */

export const STICKER_SYMBOL_SRC = '/memos/sticker_symbol.svg';

const STICKER_SYMBOL_SIZE = [57, 59];
const STICKER_SYMBOL_ANCHOR = [28.5, 29.5];
const STICKER_SYMBOL_POPUP_ANCHOR = [0, -36];

const STICKER_SYMBOL_POPUP_MESSAGE =
  'In this location you can find a sticker for your collection.';

/** Fixed spots spread across Antwerp (stable on reload). */
export const MAP_STICKER_SYMBOL_LOCATIONS = [
  { id: 'sticker-symbol-1', ll: [51.2285, 4.3920] },
  { id: 'sticker-symbol-2', ll: [51.2120, 4.4180] },
  { id: 'sticker-symbol-3', ll: [51.2340, 4.4080] },
];

function stickerSymbolHtml() {
  return `<img class="map-sticker-symbol-img" src="${STICKER_SYMBOL_SRC}" alt="" aria-hidden="true" />`;
}

function stickerSymbolPopupHtml() {
  return `<div class="map-sticker-symbol-popup">
    <p class="map-sticker-symbol-popup-text">${STICKER_SYMBOL_POPUP_MESSAGE}</p>
  </div>`;
}

export function syncMapStickerSymbols(L, map, layerRef, suppressClickRef) {
  if (!L || !map) return;

  if (!layerRef.current) {
    layerRef.current = L.layerGroup().addTo(map);
  }

  layerRef.current.clearLayers();

  for (const spot of MAP_STICKER_SYMBOL_LOCATIONS) {
    const icon = L.divIcon({
      className: 'map-sticker-symbol-marker',
      html: stickerSymbolHtml(),
      iconSize: STICKER_SYMBOL_SIZE,
      iconAnchor: STICKER_SYMBOL_ANCHOR,
      popupAnchor: STICKER_SYMBOL_POPUP_ANCHOR,
    });
    const marker = L.marker(spot.ll, { icon });
    marker.bindPopup(stickerSymbolPopupHtml(), {
      className: 'map-sticker-symbol-popup-wrapper leaflet-popup-formatting',
      maxWidth: 208,
      minWidth: 208,
      closeButton: true,
    });
    marker.on('click', (event) => {
      L.DomEvent.stopPropagation(event);
      if (suppressClickRef) suppressClickRef.current = true;
      setTimeout(() => {
        if (suppressClickRef) suppressClickRef.current = false;
      }, 60);
    });
    marker.addTo(layerRef.current);
  }
}
