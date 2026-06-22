function MicIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchListeningView({
  error,
  title = 'Listening...',
  copy = 'Searching by place name, event name, memo or address.',
}) {
  return (
    <section className="search-listening" aria-live="polite" aria-labelledby="search-listening-heading">
      <div className="search-listening-visual" aria-hidden="true">
        <span className="search-listening-ring search-listening-ring--4" />
        <span className="search-listening-ring search-listening-ring--3" />
        <span className="search-listening-ring search-listening-ring--2" />
        <span className="search-listening-ring search-listening-ring--1" />
        <div className="search-listening-core">
          <MicIcon />
        </div>
      </div>

      <h2 id="search-listening-heading" className="search-listening-title">{title}</h2>
      <p className="search-listening-copy">{copy}</p>

      {error && (
        <p className="search-listening-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
