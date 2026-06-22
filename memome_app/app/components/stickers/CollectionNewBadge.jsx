const NEW_BADGE_SRC = '/digitalStickers/new_badge.svg';

export default function CollectionNewBadge({ className = 'stickers-collection-new-badge' }) {
  return (
    <img
      src={NEW_BADGE_SRC}
      alt="New!"
      className={className}
      draggable={false}
    />
  );
}
