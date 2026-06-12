import { searchAntwerpPlaces } from '../utils/locationSearch.server';

export async function loader({ request }) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  const result = await searchAntwerpPlaces(q);
  return Response.json(result);
}
