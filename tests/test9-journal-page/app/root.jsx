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
  useRouteError,
  redirect,
} from "react-router";

import "./app.css";
import { APP_ORIGIN, isAllowedDevOrigin } from "./config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthLoading from "./components/auth/AuthLoading";
import { CreatedMemosProvider } from "./context/CreatedMemosContext";
import {
  CreateJournalProvider,
  CustomJournalsProvider,
} from "./context/CreateJournalContext";
import { EditJournalProvider } from "./context/EditJournalContext";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { DiscoverFavesProvider } from "./context/DiscoverFavesContext";
import { SavedMemosProvider } from "./context/SavedMemosContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { appAuthMiddleware } from "./middleware/clientAuth";
import { bootstrapAuthSession, isAuthBootstrapped } from "./utils/authSession";
import { isPublicAppPath } from "./utils/appPaths";
import { fetchCollectedStickers } from "./utils/collectibleStore";
import { loadStickersFromPublic } from "./utils/stickers.server";
import { getSafeFallbackPath, FALLBACK_JOURNALS } from "./utils/appPaths";

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

export function shouldRevalidate({ formAction }) {
  return Boolean(formAction);
}

export const clientMiddleware = appAuthMiddleware;

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
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const isPublic = isPublicAppPath(pathname);

  const bootstrapped = isAuthBootstrapped();

  if (!isPublic && !bootstrapped && loading) {
    return <AuthLoading />;
  }

  if (!isPublic && bootstrapped && !user) {
    return <AuthLoading />;
  }

  return (
    <CollectedStickersProvider collectedStickers={collectedStickers}>
      <CreatedMemosProvider>
        <CustomJournalsProvider>
          <CreateJournalProvider>
            <EditJournalProvider>
              <DiscoverFavesProvider>
                <SavedMemosProvider>
                  <StickerCatalogProvider stickers={stickers}>
                    <Outlet />
                  </StickerCatalogProvider>
                </SavedMemosProvider>
              </DiscoverFavesProvider>
            </EditJournalProvider>
          </CreateJournalProvider>
        </CustomJournalsProvider>
      </CreatedMemosProvider>
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

  if (error instanceof Response && error.status >= 300 && error.status < 400) {
    const location = error.headers.get('Location');
    if (location) return <Navigate to={location} replace />;
  }

  if (
    pathname.startsWith('/diary/')
    || /^\/journals\/[^/]+\/edit/.test(pathname)
  ) {
    return <Navigate to={FALLBACK_JOURNALS} replace />;
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
