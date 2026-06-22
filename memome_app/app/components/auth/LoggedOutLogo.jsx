import { loggedOutAssets } from '../../utils/loggedOutAssets';

export default function LoggedOutLogo() {
  return (
    <div className="logged-out-logo" aria-label="MemoMe">
      {/* <div className="logged-out-logo__orbit">
        <img
          className="logged-out-logo__text"
          src={loggedOutAssets.logoPt1}
          alt="MemoMe logo text"
          aria-hidden="true"
        />
        <div className="logged-out-logo__pin-arm" aria-hidden="true">
          <img
            className="logged-out-logo__pin"
            src={loggedOutAssets.logoPt2}
            alt="MemoMe logo map pin"
          />
        </div>
      </div> */}
      <img className="logged-out-logo-img" src={loggedOutAssets.logoSvg} alt="Logo of MemoMe app" aria-hidden="true" />
    </div>
  );
}
