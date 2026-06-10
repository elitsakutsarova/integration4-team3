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
import { useLayoutEffect } from "react";

import "./app.css";
import { APP_ORIGIN, isAllowedDevOrigin } from "./config";
import { AuthProvider } from "./context/AuthContext";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { bootstrapAuthSession } from "./utils/authSession";
import { fetchCollectedStickers } from "./utils/collectibleStore";
import { registerAppRevalidate } from "./utils/revalidateApp";
import { loadStickersFromPublic } from "./utils/stickers.server";

// loads stickers from public/stickers (server-side)
export async function loader() {
  const stickers = loadStickersFromPublic();
  return { stickers };
}


export async function clientLoader({ serverLoader }) {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { origin, pathname, search, hash } = window.location;
    if (!isAllowedDevOrigin(origin)) {
      const target = new URL(`${pathname}${search}${hash}`, APP_ORIGIN).href;
      if (new URL(target).origin !== origin) {
        throw redirect(target);
      }
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
        <AuthProvider>
          {children}
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { stickers, collectedStickers } = useLoaderData();
  const { revalidate } = useRevalidator();

  useLayoutEffect(() => {
    registerAppRevalidate(revalidate);
  }, [revalidate]);

  return (
    <CollectedStickersProvider collectedStickers={collectedStickers}>
      <StickerCatalogProvider stickers={stickers}>
        <Outlet />
      </StickerCatalogProvider>
    </CollectedStickersProvider>
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
