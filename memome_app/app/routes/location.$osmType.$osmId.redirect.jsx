// legacy location detail URL — redirect into discover desktop panel

import { redirect } from 'react-router';
import { buildDiscoverLocationPath } from '../utils/legacyDiscoverRedirects';

export async function loader({ params, request }) {
  throw redirect(buildDiscoverLocationPath(params, request));
}

export async function clientLoader({ params, request }) {
  throw redirect(buildDiscoverLocationPath(params, request));
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return null;
}

export default function LegacyLocationDetailRedirect() {
  return null;
}
