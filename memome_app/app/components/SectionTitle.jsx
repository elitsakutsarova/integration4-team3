export default function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`section-title ${className}`.trim()}>
      {children}
    </h2>
  );
}
