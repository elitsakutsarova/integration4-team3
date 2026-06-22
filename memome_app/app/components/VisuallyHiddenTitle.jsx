export default function VisuallyHiddenTitle({ id, children, as: Tag = 'h2' }) {
  return (
    <Tag id={id} className="visually-hidden">
      {children}
    </Tag>
  );
}
