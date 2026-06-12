import { createMemoAction } from '../utils/createMemoAction';

/** Server stub so POST is accepted under SSR; clientAction runs in the browser. */
export async function action() {
  return null;
}

export async function clientAction({ request }) {
  return createMemoAction(request);
}
