/** Decorative assets for the Maps page (public/journals). */
const DISCOVER = '/discover';

function asset(base, filename) {
  return `${base}/${encodeURIComponent(filename)}`;
}

export const discoverAssets = {
  topGrid: `${DISCOVER}/discover_grid.svg`,
  gridPattern: `${DISCOVER}/discover_grid-pattern.svg`,
};
