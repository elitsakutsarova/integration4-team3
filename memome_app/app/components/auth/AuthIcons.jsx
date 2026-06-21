export function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
      <path d="M0 16V0H20V16H0ZM10 9L2 4V14H18V4L10 9ZM10 7L18 2H2L10 7ZM2 4V2V14V4Z" fill="#797979" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="20" viewBox="0 0 15 20" fill="none">
      <path d="M0 20V6.66667H2.8125V4.76191C2.8125 3.44444 3.26969 2.32159 4.18406 1.39333C5.09844 0.46508 6.20375 0.000635571 7.5 6.50089e-07C8.79625 -0.000634271 9.90188 0.46381 10.8169 1.39333C11.7319 2.32286 12.1888 3.44571 12.1875 4.76191V6.66667H15V20H0ZM1.875 18.0952H13.125V8.57143H1.875V18.0952ZM4.6875 6.66667H10.3125V4.76191C10.3125 3.96825 10.0391 3.29365 9.49219 2.7381C8.94531 2.18254 8.28125 1.90476 7.5 1.90476C6.71875 1.90476 6.05469 2.18254 5.50781 2.7381C4.96094 3.29365 4.6875 3.96825 4.6875 4.76191V6.66667Z" fill="#797979" />
    </svg>
  );
}

export function EyeIcon({ off = false }) {
  if (off) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
        <path d="M2.5 0.335938L12.5 11.3359M9.18098 7.68584C8.72219 8.10613 8.12193 8.3382 7.49973 8.33584C6.99515 8.33579 6.50239 8.18305 6.08624 7.8977C5.67008 7.61235 5.35001 7.20776 5.16811 6.7371C4.9862 6.26645 4.95097 5.75176 5.06705 5.26071C5.18313 4.76966 5.44509 4.32523 5.81848 3.98584M4.125 2.12354C1.575 3.41104 0.5 5.83604 0.5 5.83604C0.5 5.83604 2.5 10.336 7.5 10.336C8.67161 10.3456 9.82861 10.0756 10.875 9.54853M12.5383 8.4047C13.9008 7.18595 14.5008 5.83595 14.5008 5.83595C14.5008 5.83595 12.5008 1.33595 7.50078 1.33595C7.06732 1.3351 6.63455 1.37064 6.20703 1.4422M7.96875 3.37988C8.5004 3.48062 8.98487 3.75155 9.34903 4.15179C9.71319 4.55203 9.93729 5.05985 9.9875 5.59863" stroke="#797979" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11" viewBox="0 0 15 11" fill="none">
      <path d="M0.652222 5.24967C0.652222 5.24967 2.98556 0.583008 7.06889 0.583008C11.1522 0.583008 13.4856 5.24967 13.4856 5.24967C13.4856 5.24967 11.1522 9.91634 7.06889 9.91634C2.98556 9.91634 0.652222 5.24967 0.652222 5.24967Z" stroke="#797979" strokeWidth="1.16667" strokeLinecap="round" />
      <path d="M7.06889 6.99967C8.03539 6.99967 8.81889 6.21617 8.81889 5.24967C8.81889 4.28318 8.03539 3.49967 7.06889 3.49967C6.10239 3.49967 5.31889 4.28318 5.31889 5.24967C5.31889 6.21617 6.10239 6.99967 7.06889 6.99967Z" stroke="#797979" strokeWidth="1.16667" strokeLinecap="round" />
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
