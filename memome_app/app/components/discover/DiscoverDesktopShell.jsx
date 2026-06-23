import { createContext, useContext, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router';
import SearchOpenButton from '../search/SearchOpenButton';
import { isJournalsPanelRoute, paths } from '../../utils/appPaths';
import { scrollDiscoverToTop } from '../../utils/discoverScroll';

const DiscoverToolbarContext = createContext(null);

export function useDiscoverToolbarSlot() {
  return useContext(DiscoverToolbarContext);
}

export default function DiscoverDesktopShell({ children }) {
  const [toolbar, setToolbar] = useState(null);
  const { pathname, search } = useLocation();
  const isDiscoverSearch = pathname === paths.discoverSearch;
  const showPanelSearch = !isDiscoverSearch && !isJournalsPanelRoute(pathname);

  useLayoutEffect(() => {
    scrollDiscoverToTop();
    const frame = window.requestAnimationFrame(scrollDiscoverToTop);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search]);

  return (
    <DiscoverToolbarContext.Provider value={setToolbar}>
      <div className="discover-shell">
        <div className="discover-desktop-toolbar">{toolbar}</div>

        <div className="discover-desktop-panel">
          {showPanelSearch && (
            <header className="discover-desktop-panel-head">
              <div className="discover-search-container">
                <SearchOpenButton
                  className="discover-search discover-search--trigger"
                  variant="discover"
                  to={paths.discoverSearch}
                />
              </div>
            </header>
          )}

          <div className="discover-desktop-panel-body">{children}</div>
        </div>
      </div>
    </DiscoverToolbarContext.Provider>
  );
}
