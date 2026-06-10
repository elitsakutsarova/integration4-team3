import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "react-router";

import "./app.css";
import { APP_ORIGIN, isAllowedDevOrigin } from "./config";
import { AuthProvider } from "./context/AuthContext";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { bootstrapAuthSession } from "./utils/authSession";
import { fetchCollectedStickers } from "./utils/collectibleStore";
import { loadStickersClient } from "./utils/loadStickersClient";
import { registerRootRevalidator } from "./utils/revalidateRoot";
import { loadStickersFromPublic } from "./utils/stickers.server";

// loads stickers from public/stickers (server-side)
export async function loader() {
  const stickers = loadStickersFromPublic();
  return { stickers };
}


// extra client-side setup
export async function clientLoader({ serverLoader }) {
  // checks if we are in the development environment or in a browser
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // if the current URL isn't allowed:
    if (!isAllowedDevOrigin(window.location.origin)) {
     // redirects to:
      const target = `${APP_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(target);
    }
    //example: current: http://127.0.0.1:5173, redirect to: http://localhost:5173
  }

  // get server data
  const serverData = await serverLoader();
  // if server already provided stickers, use them, otherwise load them in browser as fallback
  const stickers = serverData.stickers?.length
    ? serverData.stickers
    : (await loadStickersClient());

    // check Supabase authentification, restore login state and return current user

  const user = await bootstrapAuthSession();
  // load collected stickers for the current user if the user exiss and the id is not null
  const collectedStickers = await fetchCollectedStickers(user?.id ?? null);

  //return all data
  return {
    stickers: stickers.length ? stickers : serverData.stickers,
    collectedStickers,
  };
}

// run the client loader while react takes over the html sent from the server
clientLoader.hydrate = true;

// fonts
export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:ital@1&display=swap",
  },
];

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration /> 
        <Scripts /> 
      </body>
    </html>
  );
}

// root component
// any page can access user, stickers and collected stickers without prop "drilling"
export default function App() {
  // get loader data
  const { stickers, collectedStickers } = useLoaderData();
  // allow manual refresh of loader data
  const revalidator = useRevalidator();
  // store globally
  registerRootRevalidator(() => revalidator.revalidate());

  // provides authentication state to the whole app
  return (
    <AuthProvider>
      <CollectedStickersProvider collectedStickers={collectedStickers}>
        <StickerCatalogProvider stickers={stickers}>
          <Outlet />
        </StickerCatalogProvider>
      </CollectedStickersProvider>
    </AuthProvider>
  );
}

// catches crashes
export function ErrorBoundary({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ padding: '4rem 1rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ width: '100%', padding: '1rem', overflowX: 'auto', fontSize: '12px' }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
