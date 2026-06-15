import { useMemo } from 'react';

const SHARE_ASSETS = {
  decorTop: '/journals/recap/share-trip/Frame 15148.svg',
  decorLeft: '/journals/recap/share-trip/Frame 15143.svg',
  decorRight: '/journals/recap/share-trip/Frame 15144.svg',
};

const CONTACTS = [
  { id: 'ella', name: 'Ella Fanning', color: '#e8c4b8' },
  { id: 'mike', name: 'Mike Townsend', color: '#b8c8e8' },
  { id: 'celine', name: 'Celine Who', color: '#c8e8b8' },
];

const BASE_APPS = [
  {
    id: 'download',
    label: 'Download',
    bg: '#1952ff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  { id: 'airdrop', label: 'AirDrop', bg: '#0088ff', icon: '◉' },
  { id: 'messages', label: 'Messages', bg: '#34c759', icon: '💬' },
  { id: 'mail', label: 'Mail', bg: '#007aff', icon: '✉️' },
  { id: 'whatsapp', label: 'WhatsApp', bg: '#25d366', icon: '📞' },
];

const INSTAGRAM_APP = {
  id: 'instagram',
  label: 'Instagram',
  bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
  icon: '📷',
};

function canShareFiles() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function RecapShareSheet({
  journalTitle,
  onClose,
  onShareApp,
  onShareContact,
  disabled = false,
}) {
  const apps = useMemo(() => {
    const list = BASE_APPS.map((app) => (
      app.id === 'download' ? { ...app, icon: <DownloadIcon /> } : app
    ));
    if (canShareFiles()) list.push(INSTAGRAM_APP);
    return list;
  }, []);

  return (
    <div className="recap-share-backdrop" onClick={onClose}>
      <div className="recap-share-sheet" onClick={(event) => event.stopPropagation()}>
        <img src={SHARE_ASSETS.decorLeft} alt="" className="recap-share-decor recap-share-decor--left" aria-hidden="true" />
        <img src={SHARE_ASSETS.decorRight} alt="" className="recap-share-decor recap-share-decor--right" aria-hidden="true" />

        <div className="recap-share-handle" aria-hidden="true" />

        <div className="recap-share-header">
          <h2 className="recap-share-title">Share recap</h2>
          <div className="recap-share-trip-banner">
            <img src={SHARE_ASSETS.decorTop} alt="" className="recap-share-trip-line" aria-hidden="true" />
            <p className="recap-share-trip-name">{journalTitle}</p>
          </div>
        </div>

        <div className="recap-share-divider" aria-hidden="true" />

        <div className="recap-share-contacts">
          {CONTACTS.map((contact) => (
            <button
              key={contact.id}
              type="button"
              className="recap-share-contact"
              disabled={disabled}
              onClick={() => onShareContact?.(contact.id)}
            >
              <span className="recap-share-contact-avatar" style={{ background: contact.color }} />
              <span className="recap-share-contact-name">{contact.name}</span>
            </button>
          ))}
        </div>

        <div className="recap-share-divider recap-share-divider--apps" aria-hidden="true" />

        <div className="recap-share-apps">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              className="recap-share-app"
              disabled={disabled}
              onClick={() => onShareApp?.(app.id)}
            >
              <span className="recap-share-app-icon" style={{ background: app.bg }}>
                {app.icon}
              </span>
              <span className="recap-share-app-label">{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
