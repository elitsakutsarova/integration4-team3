import { Link } from 'react-router';
import { paths } from '../utils/appPaths';

export default function MapGuestCta() {
  return (
    <div className="map-guest-cta">
      <div className="map-guest-panel">
        <p className="map-guest-panel-copy">
          Create account or log in to get the full experience
        </p>
        <Link to={paths.register} className="map-guest-panel-btn">
          Create Account
        </Link>
        <p className="map-guest-panel-login">
          Already have an account?{' '}
          <Link to={paths.login}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
