import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import FavouritesMemosPage from '../components/profile/FavouritesMemosPage';

export default function ProfileFavouritesMemosRoute() {
  const { favouriteMemos, favouriteMemosSync } = useOutletContext();
  const [memos, setMemos] = useState(favouriteMemosSync);

  useEffect(() => {
    setMemos(favouriteMemosSync);
  }, [favouriteMemosSync]);

  useEffect(() => {
    let cancelled = false;

    void favouriteMemos.then((resolved) => {
      if (!cancelled) setMemos(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [favouriteMemos]);

  return <FavouritesMemosPage favouriteMemos={memos} />;
}
