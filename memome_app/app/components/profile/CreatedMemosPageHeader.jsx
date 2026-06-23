import { paths } from '../../utils/appPaths';
import BackChevron from '../BackChevron';
import { accountAssets } from '../../utils/accountAssets';

export default function CreatedMemosPageHeader() {
  return (
    <header className="created-memos-header">
      <div className="created-memos-hero-deco" aria-hidden="true">
        <img className="created-memos-hero-grid" src={accountAssets.greenGrid} alt="Decorative pixel grid background" />
        <div className="created-memos-hero-grid-pattern" />
        <svg className="created-memos-hero-wave" xmlns="http://www.w3.org/2000/svg" width="175" height="85" viewBox="0 0 175 85" fill="none">
          <path d="M0.29541 82.3587C25.0116 88.4492 34.8981 70.7309 27.2086 56.8882C17.9814 40.2771 4.93192 32.777 13.4774 15.9138C25.2954 -7.40723 52.9343 0.48608 70.05 15.9138C116.736 57.9956 142.54 -11.2178 173.295 28.0954" stroke="#A3BAFF" strokeWidth="2.47" strokeDasharray="8 8" />
        </svg>
      </div>
      <div className="created-memos-title-row">
        <div className="created-memos-titles">
          <BackChevron
            className="created-memos-back"
            to={paths.profile}
            label="Back to profile"
          />
            <h1 className="created-memos-title">Created Memos</h1>
        </div>
        <div className="created-memos-title-icon" aria-hidden="true">
            <svg className="created-memos-pin-icon" xmlns="http://www.w3.org/2000/svg" width="43" height="59" viewBox="0 0 43 59" fill="none">
              <path d="M24.62 0.380988C37.0845 2.50879 43.9701 12.269 41.8341 24.7816C39.6981 37.2942 25.0976 47.679 14.652 58.773C8.47834 44.8419 -1.85009 30.2015 0.285923 17.6889C2.42194 5.17637 12.1556 -1.74681 24.62 0.380988ZM22.84 10.8081C20.0852 10.3379 17.2557 10.9854 14.9739 12.6084C12.6921 14.2313 11.1451 16.6967 10.673 19.4621C10.2009 22.2276 10.8425 25.0666 12.4566 27.3546C14.0707 29.6426 16.5252 31.1921 19.28 31.6624C22.0348 32.1327 24.8643 31.4851 27.1461 29.8622C29.4279 28.2393 30.975 25.7739 31.447 23.0084C31.9191 20.243 31.2775 17.404 29.6634 15.116C28.0493 12.828 25.5948 11.2784 22.84 10.8081Z" fill="#7597FF" />
            </svg>
        </div>
      </div>
    </header>
  );
}
