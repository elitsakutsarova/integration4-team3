/** Decorative assets for the Discover page (public/journals). */
const DISCOVER = '/discover';

function asset(base, filename) {
  return `${base}/${encodeURIComponent(filename)}`;
}

export const discoverAssets = {
  topGrid: `${DISCOVER}/discover_grid.svg`,
  greenGrid: `${DISCOVER}/green-grid.svg`,
  gridPattern: `${DISCOVER}/discover_grid-pattern.svg`,
  doodle: `${DISCOVER}/doodle.svg`,
  pin: `${DISCOVER}/pin.svg`,
  selectedText: `${DISCOVER}/selected-text.svg`,
  purple_pin: `${DISCOVER}/purple_pin.svg`,
};
