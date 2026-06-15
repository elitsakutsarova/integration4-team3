import QrCode from './QrCode';

/** Client-only QR for the connect share URL (avoids SSR issues). */
export default function ConnectQr({ url, room }) {
  if (!url) return null;

  return (
    <div className="connect-qr">
      <p className="connect-label">Scan to connect</p>
      <div className="connect-qr-frame">
        <QrCode
          value={url}
          size={200}
          label={`QR code to join room ${room}`}
        />
      </div>
      <p className="connect-qr-caption">
        Point your phone camera here · room <strong>{room}</strong>
      </p>
    </div>
  );
}
