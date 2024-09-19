import clsx from "clsx";

import { Link } from "@remix-run/react";
import { useMenuContext } from "~/routes/_docs+/docs.$ref";
import { useIsActivePath } from "~/hooks/use-is-active-path";

export function Navigation({
  className,
  onLinkClick,
}: {
  className?: string;
  onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  const menu = useMenuContext();

  return (
    <nav className={clsx("text-base lg:text-sm", className)}>
      <ul className="space-y-9">
        {menu?.map((section) => (
          <div key={section.attrs.title}>
            <h2 className="font-display font-medium text-slate-900 dark:text-white">
              {section.attrs.title}
            </h2>
            <div className="mt-2 space-y-2 border-l-2 border-slate-100 lg:mt-4 lg:space-y-4 lg:border-slate-200 dark:border-slate-800">
              {section.children.map((link) => (
                <li key={link.slug} className="relative">
                  <Link
                    to={link.slug}
                    onClick={onLinkClick}
                    className={clsx(
                      "block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full",
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      useIsActivePath(link.slug)
                        ? "font-semibold text-sky-500 before:bg-sky-500"
                        : "text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {link.attrs.title} {link.attrs.new && "🆕"}
                  </Link>
                </li>
              ))}
            </div>
          </div>
        ))}
      </ul>
    </nav>
  );
}
