import clsx from "clsx";

import {
  Link,
  useLocation,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { MenuDoc } from "~/modules/gh-docs/.server/docs";

function ArrowIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <path d="m9.182 13.423-1.17-1.16 3.505-3.505H3V7.065h8.517l-3.506-3.5L9.181 2.4l5.512 5.511-5.511 5.512Z" />
    </svg>
  );
}

function PageLink({
  attrs: { title },
  slug,
  branch,
  dir = "next",
  className,
}: {
  attrs: { title: string };
  slug: string;
  branch: string;
  className?: string;
  dir?: "previous" | "next";
}) {
  const { lang = "en" } = useParams();
  return (
    <div className={className}>
      <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">
        {dir === "next" ? "Next" : "Previous"}
      </dt>
      <dd className="mt-1">
        <Link
          to={`/docs/${lang}/${branch}/${slug}`}
          className={clsx(
            "flex items-center gap-x-1 text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300",
            dir === "previous" && "flex-row-reverse"
          )}
        >
          {title}
          <ArrowIcon
            className={clsx(
              "h-4 w-4 flex-none fill-current",
              dir === "previous" && "-scale-x-100"
            )}
          />
        </Link>
      </dd>
    </div>
  );
}

export function PrevNextLinks() {
  const pathname = useLocation().pathname;
  const { lang = "en", ref: branch } = useParams();
  invariant(branch, "Ref must be provided");
  const menu = useOutletContext<MenuDoc[]>();
  invariant(menu, "Menu context must be provided");
  const allLinks = menu.flatMap((section) => section.children);
  const linkIndex = allLinks.findIndex(
    (link) => `/docs/${lang}/${branch}/${link.slug}` === pathname
  );
  const previousPage = linkIndex > -1 ? allLinks[linkIndex - 1] : null;
  const nextPage = linkIndex > -1 ? allLinks[linkIndex + 1] : null;

  if (!nextPage && !previousPage) {
    return null;
  }

  return (
    <dl className="mt-12 flex border-t border-slate-200 pt-6 dark:border-slate-800">
      {previousPage && (
        <PageLink dir="previous" branch={branch} {...previousPage} />
      )}
      {nextPage && (
        <PageLink
          className="ml-auto text-right"
          branch={branch}
          {...nextPage}
        />
      )}
    </dl>
  );
}
