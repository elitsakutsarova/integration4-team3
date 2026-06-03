import { useEffect, useRef, useState } from 'react';

const PINS = [
  {
    type: 'memory',
    ll: [48.8534, 2.3488],
    quote: 'I had the best kebab at 4AM here',
    location: 'Liva Kebab',
    tags: ['Food', 'Added by Local'],
  },
  {
    type: 'memory',
    ll: [48.858, 2.347],
    quote: 'Perfect croissant and people-watching spot',
    location: 'Café Voltaire',
    tags: ['Food', 'Added by Local'],
  },
  {
    type: 'event',
    ll: [48.8606, 2.3376],
    label: 'De Nor',
    title: 'Bruismelk Festival',
    tags: ['Festival', 'Music'],
    likes: 268,
    badge: 'Now',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf5294ceeb?w=200&h=200&fit=crop',
  },
  {
    type: 'event',
    ll: [48.8628, 2.362],
    label: 'Marais',
    title: 'Gallery Night',
    tags: ['Art', 'Culture'],
    likes: 142,
    badge: 'Tonight',
    image:
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&h=200&fit=crop',
  },
];

const SQUARE_ICON = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181F" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="#18181F" stroke="none"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
`;

const MUSIC_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#18181F">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
`;

function memoryPinHtml() {
  return `
    <div class="pin-memory">
      <div class="pin-memory-square">${SQUARE_ICON}</div>
      <div class="pin-memory-drop">
        <div class="pin-memory-dot"></div>
      </div>
    </div>
  `;
}

function eventPinHtml(label) {
  return `
    <div class="pin-event">
      <div class="pin-event-glow"></div>
      <div class="pin-event-circle">${MUSIC_ICON}</div>
      <span class="pin-event-label">${label}</span>
    </div>
  `;
}

function eventPopupHtml(pin) {
  const tags = pin.tags.map(t => `<span class="event-tag">${t}</span>`).join('');
  return `
    <div class="event-popup">
      <div class="event-popup-body">
        <div class="event-popup-text">
          <h3 class="event-popup-title">${pin.title}</h3>
          <div class="event-popup-tags">${tags}</div>
          <div class="event-popup-footer">
            <span class="event-popup-likes">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ${pin.likes}
            </span>
            <a class="event-popup-more" href="#">See more</a>
          </div>
        </div>
        <div class="event-popup-image-wrap">
          <img class="event-popup-image" src="${pin.image}" alt="${pin.title}" />
          <span class="event-popup-badge">${pin.badge}</span>
        </div>
      </div>
    </div>
  `;
}

function MemorySheet({ pin, onClose }) {
  if (!pin) return null;

  return (
    <div className="memory-sheet-backdrop" onClick={onClose}>
      <div className="memory-sheet" onClick={e => e.stopPropagation()}>
        <div className="memory-sheet-image">
          <div className="memory-sheet-img-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0b0b8" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="#b0b0b8" stroke="none" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <button type="button" className="memory-sheet-heart" aria-label="Save">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181F" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div className="memory-sheet-tags">
            {pin.tags.map(tag => (
              <span key={tag} className="memory-sheet-tag">{tag}</span>
            ))}
          </div>
        </div>
        <div className="memory-sheet-content">
          <p className="memory-sheet-quote">&ldquo;{pin.quote}&rdquo;</p>
          <div className="memory-sheet-actions">
            <span className="memory-sheet-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="memory-sheet-location-name">{pin.location}</span>
            </span>
            <button type="button" className="memory-sheet-cta">Take me there</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapView() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;

    let map;

    async function init() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      map = L.map(containerRef.current, {
        center: [48.858, 2.347],
        zoom: 14,
        zoomControl: false,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      PINS.forEach(pin => {
        const isMemory = pin.type === 'memory';

        const icon = L.divIcon({
          className: '',
          html: isMemory ? memoryPinHtml() : eventPinHtml(pin.label),
          iconSize: isMemory ? [36, 52] : [80, 72],
          iconAnchor: isMemory ? [18, 52] : [40, 40],
          popupAnchor: isMemory ? [0, -56] : [0, -44],
        });

        const marker = L.marker(pin.ll, { icon }).addTo(map);

        if (isMemory) {
          marker.on('click', () => {
            map.closePopup();
            setSelectedMemory(pin);
          });
        } else {
          marker.bindPopup(eventPopupHtml(pin), {
            className: 'event-popup-wrapper',
            maxWidth: 340,
            minWidth: 300,
          });
        }
      });

      map.on('click', () => setSelectedMemory(null));

      const BrandControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd() {
          const el = L.DomUtil.create('div', 'brand');
          el.innerHTML = `<span class="brand-name">MemoMe</span><span class="brand-script">map</span>`;
          L.DomEvent.disableClickPropagation(el);
          return el;
        },
      });
      new BrandControl().addTo(map);

      const LegendControl = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd() {
          const el = L.DomUtil.create('div', 'legend');
          el.style.marginBottom = '50px';
          el.innerHTML = `
            <div class="legend-row">
              <div class="legend-pin-memory"></div>
              <span>Memory</span>
            </div>
            <div class="legend-row">
              <div class="legend-pin-event"></div>
              <span>Event / Festival</span>
            </div>
          `;
          L.DomEvent.disableClickPropagation(el);
          return el;
        },
      });
      new LegendControl().addTo(map);
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="map-container" />
      <MemorySheet pin={selectedMemory} onClose={() => setSelectedMemory(null)} />
    </>
  );
}
