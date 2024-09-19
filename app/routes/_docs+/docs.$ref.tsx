import {
  json,
  LinksFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
  useParams,
} from "@remix-run/react";
import clsx from "clsx";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";
import { Hero } from "~/components/Hero";
import { Header } from "~/components/Header";
import { Navigation } from "~/components/Navigation";
import {
  getRepoBranches,
  getRepoDocsMenu,
  getRepoTags,
  validateParams,
} from "~/modules/gh-docs/.server";
import { MenuDoc } from "~/modules/gh-docs/.server/docs";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";
import { SearchBox } from "@orama/searchbox";
import { SearchBoxParams } from "~/modules/orama/index.client";
import oramaCss from "@orama/searchbox/dist/index.css?url";
import docsStylesheet from "~/docs.css?url";

export const unstable_shouldReload = () => false;

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: oramaCss },
    { rel: "stylesheet", href: docsStylesheet },
  ];
};

const MenuContext = createContext<undefined | MenuDoc[]>(undefined);

export const useMenuContext = () => {
  return useContext(MenuContext);
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { ref, "*": splat } = params;
  const lang = "en";

  invariant(lang, "expected `params.lang`");
  invariant(ref, "expected `params.ref`");

  const branchesInMenu = ["main", "dev"];
  const [tags, branches] = await Promise.all([
    getRepoTags(),
    getRepoBranches(),
  ]);
  if (!tags || !branches)
    throw new Response("Cannot reach GitHub", { status: 503 });

  const betterUrl = validateParams(tags, branches, { lang, ref, "*": splat });
  if (betterUrl) throw redirect("/" + betterUrl);

  const menu = await getRepoDocsMenu(ref, lang);
  const releaseBranch = "main";
  const latestVersion = getLatestVersion(tags);
  const isLatest = ref === releaseBranch || ref === latestVersion;

  return json({
    menu,
    versions: [getLatestVersion(tags)],
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: ref,
    lang,
    isLatest,
  });
};

export default function DocsLayout() {
  const { menu } = useLoaderData<typeof loader>();
  const params = useParams();
  const navigation = useNavigation();
  const navigating = navigation.location && !navigation.formData;
  const pathname = useLocation().pathname;
  const isDocsIndex = pathname === `/docs/${params.ref}/index`;

  return (
    <MenuContext.Provider value={menu}>
      <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)]">
        <Header />

        {isDocsIndex && <Hero />}

        <div className="m-auto px-4 sm:px-6 lg:px-8 xl:max-w-[90rem]">
          <div className="block lg:flex">
            <div className="hidden lg:relative lg:block lg:flex-none">
              <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 dark:hidden" />
              <div className="absolute bottom-0 right-0 top-16 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
              <div className="absolute bottom-0 right-0 top-28 hidden w-px bg-slate-800 dark:block" />
              <div className="sticky top-[4.75rem] -ml-0.5 h-[calc(100vh-4.75rem)] w-64 overflow-y-auto overflow-x-hidden py-16 pl-0.5 pr-8 xl:w-72 xl:pr-16">
                <Navigation />
              </div>
            </div>
            <div
              className={clsx(
                // add scroll margin to focused elements so that they aren't
                // obscured by the sticky header
                "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
                // Account for the left navbar
                "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
                "lg:pl-6 xl:pl-10 2xl:pl-12",
                navigating ? "opacity-25 transition-opacity delay-300" : "",
                "flex flex-col"
              )}
            >
              <Outlet context={menu} />
            </div>
          </div>
        </div>
      </div>
      <SearchBox {...SearchBoxParams} />
    </MenuContext.Provider>
  );
}
