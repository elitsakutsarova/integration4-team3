import { loadStickersFromPublic } from '../utils/stickers.server';

export async function loader() {
  return Response.json(loadStickersFromPublic());
}
