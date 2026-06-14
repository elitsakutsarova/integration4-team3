/** Universal fallback (server-safe). Client build uses gsapClient.client.js instead. */

export function loadGsap() {
  return Promise.resolve(null);
}

export function getGsap() {
  return null;
}
