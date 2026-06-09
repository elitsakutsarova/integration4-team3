import { useEffect, useState } from 'react';

/** Client-only QR for the connect share URL (avoids SSR issues). */
export default function ConnectQr({ url, room }) {
  const [QRCodeSVG, setQRCodeSVG] = useState(null);

  useEffect(() => {
    import('qrcode.react').then(mod => setQRCodeSVG(() => mod.QRCodeSVG));
  }, []);

  if (!url) return null;

  return (
    <div className="connect-qr">
      <p className="connect-label">Scan to connect</p>
      <div className="connect-qr-frame">
        {QRCodeSVG ? (
          <QRCodeSVG
            value={url}
            size={200}
            level="M"
            marginSize={2}
            role="img"
            aria-label={`QR code to join room ${room}`}
          />
        ) : (
          <span className="connect-qr-loading">Generating QR…</span>
        )}
      </div>
      <p className="connect-qr-caption">
        Point your phone camera here · room <strong>{room}</strong>
      </p>
    </div>
  );
}
