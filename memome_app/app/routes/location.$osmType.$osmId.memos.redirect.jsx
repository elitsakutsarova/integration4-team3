// legacy memo archive URL — redirect into discover desktop panel

import { redirect } from 'react-router';
import { buildDiscoverMemoArchivePath } from '../utils/legacyDiscoverRedirects';

export async function loader({ params, request }) {
  throw redirect(buildDiscoverMemoArchivePath(params, request));
}

export async function clientLoader({ params, request }) {
  throw redirect(buildDiscoverMemoArchivePath(params, request));
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return null;
}

export default function LegacyMemoArchiveRedirect() {
  return null;
}
