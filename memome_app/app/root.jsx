import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteError,
  redirect,
} from "react-router";

import { useEffect } from "react";
import "./styles/global.css";
import "./styles/modules/auth.css";
import "./styles/modules/discover.css";
import { isAllowedDevOrigin, resolveDevRedirectOrigin } from "./config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthLoading from "./components/auth/AuthLoading";
import AchievementProgressSync from "./components/AchievementProgressSync";
import { CreatedMemosProvider } from "./context/CreatedMemosContext";
import {
  CreateJournalProvider,
  CustomJournalsProvider,
} from "./context/CreateJournalContext";
import { EditJournalProvider } from "./context/EditJournalContext";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { DiscoverFavesProvider } from "./context/DiscoverFavesContext";
import DiscoverSavedModal from "./components/discover/DiscoverSavedModal";
import { SavedMemosProvider } from "./context/SavedMemosContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { appAuthMiddleware } from "./middleware/clientAuth";
import { bootstrapAuthSession, isAuthBootstrapped } from "./utils/authSession";
import { isGuestAccessiblePath, isPublicAppPath } from "./utils/appPaths";
import { fetchCollectedStickers } from "./utils/collectibleStore";
import { fetchCreatedMemosByUser } from "./utils/memoStore";
import { fetchSavedMemos } from "./utils/savedMemosStore";
import { fetchDiscoverFaves } from "./utils/discoverFavesStore";
import { loadStickersFromPublic } from "./utils/stickers.server";
import { getSafeFallbackPath, FALLBACK_JOURNALS } from "./utils/appPaths";
import { shouldRevalidateForFormAction } from "./utils/revalidatePolicy";

// loads stickers from public/stickers (server-side)
export async function loader() {
  const stickers = loadStickersFromPublic();
  return { stickers };
}


export async function clientLoader({ serverLoader }) {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { origin, pathname, search, hash } = window.location;
    if (!isAllowedDevOrigin(origin)) {
      const target = new URL(
        `${pathname}${search}${hash}`,
        resolveDevRedirectOrigin(origin),
      ).href;
      if (new URL(target).origin !== origin) {
        throw redirect(target);
      }
    }
  }

  const serverData = await serverLoader();

  const user = await bootstrapAuthSession();
  const userId = user?.id ?? null;

  const [collectedStickers, savedMemos, discoverFaves, createdMemos] = await Promise.all([
    fetchCollectedStickers(userId),
    fetchSavedMemos(userId),
    fetchDiscoverFaves(userId),
    fetchCreatedMemosByUser(userId),
  ]);

  return {
    stickers: serverData.stickers,
    collectedStickers,
    savedMemos,
    discoverFaves,
    createdMemos,
  };
}

// run the client loader while react takes over the html sent from the server
clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export function shouldRevalidate({ formAction }) {
  return shouldRevalidateForFormAction(formAction);
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
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:ital@1&family=Press+Start+2P&display=swap",
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
  const { stickers, collectedStickers, savedMemos, discoverFaves, createdMemos } = useLoaderData();
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const isPublic = isPublicAppPath(pathname);
  const isGuestRoute = isGuestAccessiblePath(pathname);
  const allowGuest = isPublic || isGuestRoute;

  const bootstrapped = isAuthBootstrapped();

  if (!allowGuest && !bootstrapped && loading) {
    return <AuthLoading />;
  }

  if (!allowGuest && bootstrapped && !user) {
    return <AuthLoading />;
  }

  return (
    <CollectedStickersProvider initialStickers={collectedStickers}>
      <AchievementProgressSync />
      <CreatedMemosProvider initialMemos={createdMemos}>
        <CustomJournalsProvider>
          <CreateJournalProvider>
            <EditJournalProvider>
              <DiscoverFavesProvider initialFaves={discoverFaves}>
                <SavedMemosProvider initialSavedMemos={savedMemos}>
                  <StickerCatalogProvider stickers={stickers}>
                    <Outlet />
                    <DiscoverSavedModal />
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
  const navigate = useNavigate();

  const redirectTarget = (() => {
    if (isRouteErrorResponse(error) && (error.status === 404 || error.status === 400)) {
      return getSafeFallbackPath(pathname);
    }
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      return error.headers.get('Location');
    }
    if (pathname.startsWith('/diary/') || /^\/journals\/[^/]+\/edit/.test(pathname)) {
      return FALLBACK_JOURNALS;
    }
    return null;
  })();

  useEffect(() => {
    if (redirectTarget) navigate(redirectTarget, { replace: true });
  }, [redirectTarget, navigate]);

  if (redirectTarget) return null;

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
