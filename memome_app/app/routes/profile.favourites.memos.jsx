import { Await, useOutletContext } from 'react-router';
import { Suspense } from 'react';
import FavouritesMemosPage from '../components/profile/FavouritesMemosPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';

function FavouritesMemosFallback({ favouriteMemosSync, savedMemoCount }) {
  if (savedMemoCount > 0 && favouriteMemosSync.length === 0) {
    return <FavouritesLoading />;
  }

  return <FavouritesMemosPage favouriteMemos={favouriteMemosSync} />;
}

export default function ProfileFavouritesMemosRoute() {
  const {
    favouriteMemos,
    favouriteMemosSync,
    savedMemoCount,
  } = useOutletContext();

  return (
    <Suspense
      fallback={(
        <FavouritesMemosFallback
          favouriteMemosSync={favouriteMemosSync}
          savedMemoCount={savedMemoCount}
        />
      )}
    >
      <Await
        resolve={favouriteMemos}
        errorElement={(
          <FavouritesMemosPage favouriteMemos={favouriteMemosSync} />
        )}
      >
        {(resolved) => <FavouritesMemosPage favouriteMemos={resolved} />}
      </Await>
    </Suspense>
  );
}
