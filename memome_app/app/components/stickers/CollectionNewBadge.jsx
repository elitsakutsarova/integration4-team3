const NEW_BADGE_SRC = '/digitalStickers/new_badge.svg';

export default function CollectionNewBadge() {
  return (
    <img
      src={NEW_BADGE_SRC}
      alt="New!"
      className="stickers-collection-new-badge"
      draggable={false}
    />
  );
}
