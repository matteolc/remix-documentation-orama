import {
  json,
  LinksFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useLocation,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { useRef } from "react";
import invariant from "tiny-invariant";
import iconsHref from "~/icons.svg";
import { Doc, getRepoDoc } from "~/modules/gh-docs/.server";
import docsStylesheet from "~/docs.css?url";
import { useDelegatedReactRouterLinks } from "~/hooks/use-delegated-react-router-links";
import { PrevNextLinks } from "~/components/PrevNextLinks";
import { TableOfContents } from "~/components/TableOfContents";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: docsStylesheet }];
};

export const CACHE_CONTROL = {
  /**
   * Keep it in the browser (and CDN) for 5 minutes so when they click
   * back/forward/etc.  It's super fast, swr for 1 week on CDN so it stays fast
   * but people get typos fixes and stuff, too.
   */
  doc: "max-age=300, stale-while-revalidate=604800",
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.ref, "expected `ref` params");

  try {
    const slug = params["*"]?.endsWith("/changelog")
      ? "CHANGELOG"
      : `docs/${params["*"] || "index"}`;
    const doc = await getRepoDoc(params.ref, slug);
    if (!doc) throw null;
    return json({ doc }, { headers: { "Cache-Control": CACHE_CONTROL.doc } });
  } catch (_) {
    throw new Response("", { status: 404 });
  }
};

export default function Screen() {
  const { doc } = useLoaderData<typeof loader>();
  const ref = useRef<HTMLDivElement>(null);
  const params = useParams();
  const pathname = useLocation().pathname;
  const isDocsIndex = pathname === `/docs/${params.ref}/index`;
  useDelegatedReactRouterLinks(ref);
  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8">
      {isDocsIndex ? null : doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <TableOfContents doc={doc} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}

      <div className="min-w-0 px-4 pt-12 xl:mr-4 xl:flex-grow xl:pl-0 xl:pt-20">
        <div ref={ref} className="markdown w-full max-w-3xl pb-8">
          <article>
            <div
              className="md-prose pb-[33vh]"
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </article>
          <PrevNextLinks />
        </div>
      </div>
    </div>
  );
}

function SmallOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <details className="group flex flex-col lg:mt-4 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-slate-50 bg-white px-2 py-3 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:active:bg-slate-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
            />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const params = useParams();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">404</h1>
        <p className="text-lg">
          There is no doc for <i className="text-gray-500">{params["*"]}</i>
        </p>
      </div>
    );
  }

  throw error;
}
