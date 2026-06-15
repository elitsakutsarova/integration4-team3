import { redirect } from 'react-router';
import { paths } from '../utils/appPaths';

export function loader() {
  throw redirect(paths.profileFavouritesMemos);
}

export default function ProfileFavouritesIndexRedirect() {
  return null;
}
