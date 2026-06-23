import { mapAssets } from '../utils/mapAssets';

export default function MapPixelDeco({ className = '' }) {
  return (
    <div className={`map-pixel-deco${className ? ` ${className}` : ''}`} aria-hidden="true">
      <img className="map-pixel-grid" src={mapAssets.greenGrid} alt="" />
    </div>
  );
}
