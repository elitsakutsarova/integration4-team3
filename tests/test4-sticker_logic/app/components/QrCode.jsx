import { useEffect, useState } from 'react';

/** Client-only QR (avoids SSR issues with qrcode.react). */
export default function QrCode({ value, size = 200, level = 'M', label, className = '' }) {
  const [QRCodeSVG, setQRCodeSVG] = useState(null);

  useEffect(() => {
    import('qrcode.react').then(mod => setQRCodeSVG(() => mod.QRCodeSVG));
  }, []);

  if (!value) return null;

  return (
    <div className={`qr-code ${className}`.trim()}>
      {QRCodeSVG ? (
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          marginSize={2}
          role="img"
          aria-label={label ?? 'QR code'}
        />
      ) : (
        <span className="qr-code-loading">Generating QR…</span>
      )}
    </div>
  );
}
