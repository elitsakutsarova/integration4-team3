export default function MemMeLogo() {
  return (
    <div className="auth-logo" aria-label="MemMe">
      <span className="auth-logo-text">
        Mem
        <span className="auth-logo-pin" aria-hidden="true">
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
            <path
              d="M11 1C6.03 1 2 5.03 2 10c0 7.25 9 17 9 17s9-9.75 9-17c0-4.97-4.03-9-9-9Z"
              fill="currentColor"
            />
            <circle cx="11" cy="10" r="3.5" fill="var(--bg)" />
          </svg>
        </span>
        Me
      </span>
    </div>
  );
}
