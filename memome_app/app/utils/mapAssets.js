/** Decorative assets for the Maps page (public/journals). */
const MAP = '/map';

function asset(base, filename) {
  return `${base}/${encodeURIComponent(filename)}`;
}

export const mapAssets = {
  greenGrid: `${MAP}/top-grid.svg`,
};
