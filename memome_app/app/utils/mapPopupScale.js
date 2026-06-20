/** Shared responsive scale for map memo sheets and event popups on narrow viewports. */

export const MAP_POPUP_DESIGN_WIDTH = 361;
export const MAP_POPUP_RESPONSIVE_VIEWPORT = 359;
export const MAP_POPUP_HORIZONTAL_MARGIN = 32;

export function getMapPopupScale() {
  if (typeof window === 'undefined') return 1;
  if (window.innerWidth > MAP_POPUP_RESPONSIVE_VIEWPORT) return 1;
  return Math.min(
    1,
    (window.innerWidth - MAP_POPUP_HORIZONTAL_MARGIN) / MAP_POPUP_DESIGN_WIDTH,
  );
}

export function buildMapPopupDockTransform(scale) {
  if (scale === 1) return 'translateX(-50%)';
  return `translateX(-50%) scale(${scale})`;
}

export function applyMapPopupContentScale(element, scale = getMapPopupScale()) {
  if (!element) return;

  if (scale === 1) {
    element.style.transform = '';
    element.style.transformOrigin = '';
    return;
  }

  element.style.transform = `scale(${scale})`;
  element.style.transformOrigin = 'center bottom';
}
