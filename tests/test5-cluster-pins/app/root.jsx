import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import "./app.css";
import AppOriginGuard from "./components/AppOriginGuard";
import { AuthProvider } from "./context/AuthContext";
import { CollectedStickersProvider } from "./context/CollectedStickersContext";
import { StickerCatalogProvider } from "./context/StickerCatalogContext";
import { loadStickersFromPublic } from "./utils/stickers.server";

export async function loader({ request }) {
  const stickers = loadStickersFromPublic();
  return { stickers };
}

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
  const data = useLoaderData();
  const stickers = data?.stickers ?? [];
  return (
    <AppOriginGuard>
      <AuthProvider>
        <CollectedStickersProvider>
        <StickerCatalogProvider stickers={stickers}>
          <Outlet />
        </StickerCatalogProvider>
        </CollectedStickersProvider>
      </AuthProvider>
    </AppOriginGuard>
  );
}

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
