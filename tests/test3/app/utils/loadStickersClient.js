/** Client-side sticker loading — uses static manifest (works on mobile over LAN) */

export async function loadStickersClient() {
  if (typeof window === 'undefined') return [];

  const base = window.location.origin;
  const sources = [
    `${base}/stickers/manifest.json`,
    `${base}/api/stickers`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      /* try next source */
    }
  }

  return [];
}
