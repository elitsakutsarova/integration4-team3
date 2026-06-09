const CONTACTS = [
  { name: 'Ella Fanning', color: '#e8c4b8' },
  { name: 'Mike Townsend', color: '#b8c8e8' },
  { name: 'Celine Who', color: '#c8e8b8' },
];

const APPS = [
  { id: 'airdrop', label: 'AirDrop', bg: '#0088ff', icon: '◉' },
  { id: 'messages', label: 'Messages', bg: '#34c759', icon: '💬' },
  { id: 'mail', label: 'Mail', bg: '#007aff', icon: '✉️' },
  { id: 'whatsapp', label: 'WhatsApp', bg: '#25d366', icon: '📞' },
  { id: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon: '📷' },
];

export default function ShareSheet({ title, countLabel, onClose, onShareApp, onShareContact, disabled }) {
  return (
    <div className="share-sheet-backdrop" onClick={onClose}>
      <div className="share-sheet" onClick={e => e.stopPropagation()}>
        <div className="share-sheet-header">
          <div>
            <h2 className="share-sheet-title">{title}</h2>
            {countLabel && <p className="share-sheet-count">{countLabel}</p>}
          </div>
          <button type="button" className="share-sheet-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        <div className="share-contacts-row">
          {CONTACTS.map(c => (
            <button
              key={c.name}
              type="button"
              className="share-contact"
              onClick={() => onShareContact?.(c.name)}
            >
              <span className="share-contact-avatar" style={{ background: c.color }} />
              <span className="share-contact-name">{c.name}</span>
            </button>
          ))}
        </div>

        <div className="share-apps-row">
          {APPS.map(app => (
            <button
              key={app.id}
              type="button"
              className="share-app"
              disabled={disabled}
              onClick={() => onShareApp?.(app.id)}
            >
              <span
                className="share-app-icon"
                style={{ background: app.bg }}
              >
                {app.icon}
              </span>
              <span className="share-app-label">{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { CONTACTS, APPS };
