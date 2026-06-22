export default function SectionTitle({ children, className = '', id }) {
  return (
    <h2 id={id} className={`section-title ${className}`.trim()}>
      {children}
    </h2>
  );
}
