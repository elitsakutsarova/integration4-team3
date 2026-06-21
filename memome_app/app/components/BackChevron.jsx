/**
 * Reusable blue back-chevron button.
 * Pass the caller's own `className` for positioning/layout styles.
 */
export default function BackChevron({ className, onClick, label = 'Back' }) {
  return (
    <button type="button" className={`btn-chevron ${className || ''}`} onClick={onClick} aria-label={label}>
      {/* <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="#1952ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg> */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 26 24" fill="none">
        <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" strokeWidth="2.5" />
      </svg>
    </button>
  );
}
