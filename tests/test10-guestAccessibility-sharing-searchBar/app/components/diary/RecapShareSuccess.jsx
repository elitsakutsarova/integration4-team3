const SUCCESS_ASSETS = {
  decorTop: '/journals/recap/message-success/Frame 15149.svg',
  decorBottom: '/journals/recap/message-success/Frame 15149-1.svg',
  decorRight: '/journals/recap/message-success/Vector.svg',
};

export default function RecapShareSuccess({ onClose }) {
  return (
    <div className="recap-share-success-backdrop" onClick={onClose}>
      <div className="recap-share-success-card" onClick={(event) => event.stopPropagation()}>
        <div className="recap-share-success-decor recap-share-success-decor--top" aria-hidden="true">
          <img src={SUCCESS_ASSETS.decorTop} alt="" />
        </div>

        <div className="recap-share-success-body">
          <p className="recap-share-success-text">
            The recap was
            <br />
            successfully shared
          </p>
          <span className="recap-share-success-highlight" aria-hidden="true" />
        </div>

        <img
          src={SUCCESS_ASSETS.decorBottom}
          alt=""
          className="recap-share-success-decor recap-share-success-decor--bottom"
          aria-hidden="true"
        />
        <img
          src={SUCCESS_ASSETS.decorRight}
          alt=""
          className="recap-share-success-decor recap-share-success-decor--right"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
