import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Link } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/node";

import { Doc } from "~/modules/gh-docs/.server/docs";

export function TableOfContents({ doc }: { doc: SerializeFrom<Doc> }) {
  const [currentSection, setCurrentSection] = useState(doc.headings[0]?.slug);

  const getHeadings = useCallback((doc: SerializeFrom<Doc>) => {
    return doc.headings
      .map((heading) => heading.slug!)
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;

        const style = window.getComputedStyle(el);
        const scrollMt = parseFloat(style.scrollMarginTop);

        const top = window.scrollY + el.getBoundingClientRect().top - scrollMt;
        return { id, top };
      })
      .filter((x): x is { id: string; top: number } => x !== null);
  }, []);

  useEffect(() => {
    if (doc.headings.length === 0) return;
    const headings = getHeadings(doc);
    function onScroll() {
      const top = window.scrollY;
      let current = headings[0].id;
      for (const heading of headings) {
        if (top >= heading.top) {
          current = heading.id;
        } else {
          break;
        }
      }
      setCurrentSection(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [getHeadings, doc]);

  function isActive(section: SerializeFrom<Doc>["headings"][0]) {
    if (section.slug === currentSection) {
      return true;
    }
    return false;
  }

  return (
    <div className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 flex-shrink-0 self-start overflow-y-auto pb-10 xl:block">
      <nav aria-labelledby="on-this-page-title">
        {doc.headings.length > 0 && (
          <>
            <div className="mb-3 flex items-center font-semibold">
              On this page
            </div>
            <ul className="md-toc flex flex-col flex-wrap gap-1 leading-[1.125]">
              {doc.headings.map((heading, i) => (
                <li
                  key={i}
                  className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
                >
                  <Link
                    to={`#${heading.slug}`}
                    dangerouslySetInnerHTML={{ __html: heading.html || "" }}
                    className={clsx(
                      isActive(heading)
                        ? "text-sky-500"
                        : "font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
                      "block py-1 text-sm hover:text-gray-900 active:text-sky-500 dark:hover:text-gray-50 dark:active:text-sky-500"
                    )}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </div>
  );
}
