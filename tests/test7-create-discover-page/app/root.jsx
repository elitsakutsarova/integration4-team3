import {
  isRouteErrorResponse,
  Links,
  Meta,
  Navigate,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRevalidator,
  useRouteError,
  redirect,
} from "react-router";
import { useLayoutEffect } from "react";

import "./app.css";
import { APP_ORIGIN, isAllowedDevOrigin } from "./config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthLoading from "./components/auth/AuthLoading";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { DiscoverFavesProvider } from "./context/DiscoverFavesContext";
import { SavedMemosProvider } from "./context/SavedMemosContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { appAuthMiddleware } from "./middleware/clientAuth";
import { bootstrapAuthSession } from "./utils/authSession";
import { isPublicAppPath } from "./utils/appPaths";
import { fetchCollectedStickers } from "./utils/collectibleStore";
import { registerAppRevalidate } from "./utils/revalidateApp";
import { loadStickersFromPublic } from "./utils/stickers.server";
import { getSafeFallbackPath } from "./utils/safeRouteFallbacks";

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

export const clientMiddleware = appAuthMiddleware;

export function HydrateFallback() {
  return <AuthLoading />;
}

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
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const isPublic = isPublicAppPath(pathname);

  useLayoutEffect(() => {
    registerAppRevalidate(revalidate);
  }, [revalidate]);

  if (!isPublic && (loading || !user)) {
    return <AuthLoading />;
  }

  return (
    <CollectedStickersProvider collectedStickers={collectedStickers}>
      <DiscoverFavesProvider>
        <SavedMemosProvider>
          <StickerCatalogProvider stickers={stickers}>
            <Outlet />
          </StickerCatalogProvider>
        </SavedMemosProvider>
      </DiscoverFavesProvider>
    </CollectedStickersProvider>
  );
}

// Redirect invalid URLs to sensible defaults instead of showing error pages.
export function ErrorBoundary() {
  const error = useRouteError();
  const { pathname } = useLocation();

  if (isRouteErrorResponse(error) && (error.status === 404 || error.status === 400)) {
    return <Navigate to={getSafeFallbackPath(pathname)} replace />;
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = "Error";
    details = error.statusText || details;
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
