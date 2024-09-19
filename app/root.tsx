import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import { useNonce } from "./hooks/use-nonce";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { CACHE_CONTROL } from "./routes/_docs+/docs.$ref.$";
import iconsHref from "~/icons.svg";
import clsx from "clsx";
import { GlobalLoading } from "./ui/global-loading";
import { getHints } from "./hooks/use-hints";
import { getTheme, useTheme } from "./hooks/use-theme";
import { getDomainUrl } from "./modules/get-domain-url";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon-32.png", sizes: "32x32" },
  { rel: "icon", href: "/favicon-128.png", sizes: "128x128" },
  { rel: "icon", href: "/favicon-180.png", sizes: "180x180" },
  { rel: "icon", href: "/favicon-192.png", sizes: "192x192" },
  { rel: "apple-touch-icon", href: "/favicon-180.png", sizes: "180x180" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json(
    {
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: { theme: getTheme(request) },
      },
    },
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.doc,
        Vary: "Cookie",
      },
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();
  const theme = useTheme();
  return (
    <html
      lang="en"
      className={clsx(theme, "scroll-pt-[6rem] lg:scroll-pt-[4rem]")}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={clsx(
          "bg-white dark:bg-slate-900",
          "flex min-h-screen w-full flex-col overflow-x-hidden antialiased selection:bg-blue-200 selection:text-black dark:selection:bg-blue-800 dark:selection:text-white"
        )}
      >
        <GlobalLoading />
        {children}
        <img
          src={iconsHref}
          alt=""
          hidden
          // this img tag simply forces the icons to be loaded at a higher
          // priority than the scripts (chrome only for now)
          // @ts-expect-error -- silly React pretending this attribute doesn't exist
          // eslint-disable-next-line react/no-unknown-property
          fetchpriority="high"
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Oops | React Router</title>
        <Links />
      </head>
      <body className="flex bg-white text-black dark:bg-gray-900 dark:text-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-bold">Oops</div>
          <div>Something went wrong</div>
          <Link to="/" className="mt-8 underline">
            Go Home
          </Link>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
