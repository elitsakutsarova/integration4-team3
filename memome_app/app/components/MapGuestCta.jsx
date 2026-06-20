import GuestAuthCta from './GuestAuthCta';

export default function MapGuestCta({ retracted = false }) {
  return (
    <div className={['map-guest-cta', retracted ? 'map-guest-cta--retracted' : ''].filter(Boolean).join(' ')}>
      <div className="map-guest-panel">
        <GuestAuthCta copy="Create account or log in to get the full experience" />
      </div>
    </div>
  );
}
