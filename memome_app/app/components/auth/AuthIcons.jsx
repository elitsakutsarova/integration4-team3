export function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function EyeIcon({ off = false }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function BackpackIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M6 12h12" />
    </svg>
  );
}

export function HouseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

const REGISTER_ROLE_ICON_INACTIVE = '#6B7280';

export function RegisterVisitorIcon({ active = false }) {
  const fill = active ? '#005938' : REGISTER_ROLE_ICON_INACTIVE;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54" fill="none" aria-hidden="true">
      <path d="M3.77523 53.1656L0.062061 18.3631C-0.185484 16.0429 0.302251 13.9376 1.52526 12.0472C2.74828 10.1568 4.40606 8.80665 6.49861 7.99674L5.92838 2.65207L13.386 1.8564L13.9165 6.82818L23.8601 5.76727L23.3296 0.795491L30.7873 -0.000188101L31.3575 5.34448C33.5738 5.69466 35.4792 6.66466 37.0735 8.25449C38.6678 9.84432 39.5888 11.7993 39.8363 14.1195L43.5495 48.922L3.77523 53.1656ZM8.21656 47.6633L38.0473 44.4806L34.8645 14.6499C34.7187 13.2827 34.1074 12.1646 33.0308 11.2955C31.9542 10.4265 30.7314 10.0642 29.3623 10.2086L9.47517 12.3304C8.10793 12.4763 6.98989 13.0884 6.12105 14.1666C5.2522 15.2449 4.8898 16.4669 5.03384 17.8326L8.21656 47.6633ZM28.2857 35.4654L33.2575 34.9349L32.1966 24.9913L9.82359 27.3784L10.354 32.3502L27.7553 30.4936L28.2857 35.4654Z" fill={fill} />
    </svg>
  );
}

export function RegisterLocalIcon({ active = false }) {
  const fill = active ? '#0F3199' : REGISTER_ROLE_ICON_INACTIVE;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="43" height="47" viewBox="0 0 43 47" fill="none" aria-hidden="true">
      <path d="M5.3955 38.6267L12.87 39.2451L14.1069 24.2962L29.0558 25.5331L27.8189 40.482L35.2933 41.1005L37.1487 18.6771L23.1274 6.22851L7.25085 16.2033L5.3955 38.6267ZM0.000222009 43.1973L2.47403 13.2995L23.6428 -0.000207177L42.3378 16.5979L39.864 46.4958L22.4236 45.0527L23.6605 30.1038L18.6775 29.6915L17.4406 44.6404L0.000222009 43.1973Z" fill={fill} />
    </svg>
  );
}

export function CrossCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckCircleOutlineIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5l2.75 2.75L16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WarningTriangleIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
      <path d="M8 0.5L15.5 13.5H0.5L8 0.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="0.75" fill="currentColor" />
    </svg>
  );
}
