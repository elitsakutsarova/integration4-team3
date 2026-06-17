import { data, redirect } from 'react-router';
import { fallbackPathFromRequest } from '../utils/appPaths';

export function loader({ request }) {
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith('/api/')) {
    throw data('Not found', { status: 404 });
  }
  throw redirect(fallbackPathFromRequest(request));
}

export function clientLoader({ request }) {
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith('/api/')) {
    throw data('Not found', { status: 404 });
  }
  throw redirect(fallbackPathFromRequest(request));
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return null;
}

export default function CatchallRoute() {
  return null;
}
