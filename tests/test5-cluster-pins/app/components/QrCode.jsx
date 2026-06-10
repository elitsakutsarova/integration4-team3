import { lazy, Suspense } from 'react';

const QRCodeSVG = lazy(() =>
  import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })),
);

/** Client-only QR (avoids SSR issues with qrcode.react). */
export default function QrCode({ value, size = 200, level = 'M', label, className = '' }) {
  if (!value) return null;

  return (
    <div className={`qr-code ${className}`.trim()}>
      <Suspense fallback={<span className="qr-code-loading">Generating QR…</span>}>
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          marginSize={2}
          role="img"
          aria-label={label ?? 'QR code'}
        />
      </Suspense>
    </div>
  );
}
