const IDB_NAME = 'memome_webrtc';
const IDB_STORE = 'certificates';
const IDB_KEY = 'dtls-v1';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readStoredCertificate() {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function storeCertificate(cert) {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(cert, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* persistence optional */
  }
}

/** Persistent WebRTC DTLS certificate (reused across sessions on this device). */
export async function getOrCreateDtlsCertificate() {
  if (typeof RTCPeerConnection === 'undefined' || !RTCPeerConnection.generateCertificate) {
    throw new Error('WebRTC is not available in this browser.');
  }

  const existing = await readStoredCertificate();
  if (existing) return existing;

  const cert = await RTCPeerConnection.generateCertificate({
    name: 'ECDSA',
    namedCurve: 'P-256',
  });

  await storeCertificate(cert);
  return cert;
}
