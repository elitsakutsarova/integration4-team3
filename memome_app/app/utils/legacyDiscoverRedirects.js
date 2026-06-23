import { href } from 'react-router';

export function buildDiscoverLocationPath(params, request) {
  const url = new URL(request.url);
  const target = href('/discover/location/:osmType/:osmId', {
    osmType: params.osmType,
    osmId: params.osmId,
  });
  const query = url.searchParams.toString();
  return query ? `${target}?${query}` : target;
}

export function buildDiscoverMemoArchivePath(params, request) {
  const url = new URL(request.url);
  const target = href('/discover/memos/:osmType/:osmId', {
    osmType: params.osmType,
    osmId: params.osmId,
  });
  const query = url.searchParams.toString();
  return query ? `${target}?${query}` : target;
}
