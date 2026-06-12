// this component displays the user favourites page 

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { MEMO_TAG_OPTIONS } from '../../data/memoTags';
import { EventCard, PlaceCard } from '../discover/DiscoverCards';
import BottomNav from '../BottomNav';
import CollectionMemoCard from './CollectionMemoCard';
import CollectionPageHeader from './CollectionPageHeader';
import CollectionSortChips from './CollectionSortChips';

const TABS = [
  { id: 'memos', label: 'Memos' },
  { id: 'spots', label: 'Spots' },
  { id: 'events', label: 'Events' },
];

const MEMO_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...MEMO_TAG_OPTIONS.map(tag => ({ id: tag, label: tag })),
];

function filterMemosByTag(memos, tagId) {
  if (tagId === 'all') return memos;
  return memos.filter(memo => (memo.tags ?? []).includes(tagId));
}

export default function FavouritesPage({ favouriteMemos, favouriteEvents, favouritePlaces }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'memos';
  const [memoFilter, setMemoFilter] = useState('all');

  const filteredMemos = useMemo(
    () => filterMemosByTag(favouriteMemos, memoFilter),
    [favouriteMemos, memoFilter],
  );

  function setTab(tabId) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tabId === 'memos') next.delete('tab');
      else next.set('tab', tabId);
      return next;
    }, { replace: true });
  }

  return (
    <div className="collection-page">
      <CollectionPageHeader title="Favourites" />

      <div className="collection-tabs" role="tablist" aria-label="Favourites categories">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`collection-tab${activeTab === tab.id ? ' collection-tab--active' : ''}`}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'memos' && (
        <CollectionSortChips
          options={MEMO_FILTER_OPTIONS}
          value={memoFilter}
          onChange={setMemoFilter}
        />
      )}

      <div className="collection-scroll">
        {activeTab === 'memos' && (
          filteredMemos.length > 0 ? (
            <div className="collection-memo-list">
              {filteredMemos.map(memo => (
                <CollectionMemoCard key={memo.id} memo={memo} variant="favourite" />
              ))}
            </div>
          ) : (
            <p className="collection-empty">
              No favourite memos yet. Tap the heart on a map memo to save it here.
            </p>
          )
        )}

        {activeTab === 'spots' && (
          favouritePlaces.length > 0 ? (
            <div className="collection-discover-list collection-discover-list--places">
              {favouritePlaces.map(({ item }) => (
                <PlaceCard key={item.id} item={item} layout="list" />
              ))}
            </div>
          ) : (
            <p className="collection-empty">
              No favourite spots yet. Save places from Discover to see them here.
            </p>
          )
        )}

        {activeTab === 'events' && (
          favouriteEvents.length > 0 ? (
            <div className="collection-discover-list">
              {favouriteEvents.map(({ item }) => (
                <EventCard key={item.id} item={item} layout="list" />
              ))}
            </div>
          ) : (
            <p className="collection-empty">
              No favourite events yet. Save events from Discover to see them here.
            </p>
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
