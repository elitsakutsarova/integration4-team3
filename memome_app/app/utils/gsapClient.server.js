/** SSR stub — GSAP is browser-only (ESM); never import it on Vercel serverless. */

export function loadGsap() {
  return Promise.resolve(null);
}

export function getGsap() {
  return null;
}
