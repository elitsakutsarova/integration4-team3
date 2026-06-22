export const MAP_DESKTOP_BREAKPOINT = '(min-width: 48rem)';

export function isDesktopMapLayout() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MAP_DESKTOP_BREAKPOINT).matches;
}

export function getMapPinAnchorPoint(map, pin) {
  if (!map || !Array.isArray(pin?.ll) || pin.ll.length < 2) return null;

  const point = map.latLngToContainerPoint([pin.ll[0], pin.ll[1]]);
  const rect = map.getContainer().getBoundingClientRect();

  return { x: rect.left + point.x, y: rect.top + point.y };
}

export function measureMemorySheetPlacement(anchor, sheet) {
  const rect = sheet.getBoundingClientRect();
  const margin = 12;
  const tailGap = 14;
  const halfW = rect.width / 2;

  const x = Math.min(
    Math.max(anchor.x, margin + halfW),
    window.innerWidth - margin - halfW,
  );

  const spaceAbove = anchor.y - margin;
  const spaceBelow = window.innerHeight - anchor.y - margin;
  const sheetH = rect.height + tailGap;
  const below = spaceAbove < sheetH && spaceBelow > spaceAbove;

  return { x, y: anchor.y, below };
}

export function buildAnchoredSheetStyle(placement, anchor) {
  if (placement) {
    return {
      left: placement.x,
      top: placement.y,
      transform: placement.below
        ? 'translate(-50%, 14px)'
        : 'translate(-50%, calc(-100% - 14px))',
      visibility: 'visible',
    };
  }

  return {
    left: anchor.x,
    top: anchor.y,
    transform: 'translate(-50%, calc(-100% - 14px))',
    visibility: 'hidden',
  };
}
