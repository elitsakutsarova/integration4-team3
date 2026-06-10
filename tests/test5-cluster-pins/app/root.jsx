import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
  redirect,
} from "react-router";

import "./app.css";
import { APP_ORIGIN, isAllowedDevOrigin } from "./config";
import { AuthProvider } from "./context/AuthContext";
import { RevalidateProvider } from "./context/RevalidateContext";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { bootstrapAuthSession } from "./utils/authSession";
import { fetchCollectedStickers } from "./utils/collectibleStore";
import { loadStickersFromPublic } from "./utils/stickers.server";

// loads stickers from public/stickers (server-side)
export async function loader() {
  const stickers = loadStickersFromPublic();
  return { stickers };
}


export async function clientLoader({ serverLoader }) {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    if (!isAllowedDevOrigin(window.location.origin)) {
      const target = `${APP_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
      throw redirect(target);
    }
  }

  const serverData = await serverLoader();

  const user = await bootstrapAuthSession();
  const collectedStickers = await fetchCollectedStickers(user?.id ?? null);

  return {
    stickers: serverData.stickers,
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

export default function App() {
  const { stickers, collectedStickers } = useLoaderData();
  const { revalidate } = useRevalidator();

  return (
    <RevalidateProvider revalidate={revalidate}>
      <AuthProvider>
        <CollectedStickersProvider collectedStickers={collectedStickers}>
          <StickerCatalogProvider stickers={stickers}>
            <Outlet />
          </StickerCatalogProvider>
        </CollectedStickersProvider>
      </AuthProvider>
    </RevalidateProvider>
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
