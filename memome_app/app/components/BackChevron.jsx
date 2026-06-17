/**
 * Reusable blue back-chevron button.
 * Pass the caller's own `className` for positioning/layout styles.
 */
export default function BackChevron({ className, onClick, label = 'Back' }) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="#1952ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
