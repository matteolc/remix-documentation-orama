import type {
  RegisterSearchBoxProps,
  RegisterSearchButtonProps,
} from "@orama/searchbox";

export const SearchBoxParams: RegisterSearchBoxProps = {
  cloudConfig: {
    // The search endpoint for the Orama index
    url: "https://cloud.orama.run/v1/indexes/remix-run-aixd3c",
    // The public API key for performing search. This is commit-safe.
    key: "9hxktzDg25BvC8l1m3gV1vpF8RpIVOSj",
  },
  colorScheme: "dark",
  theme: "secondary",
  resultsMap: {
    description: "content",
  },
  facetProperty: "section",
  searchParams: {
    threshold: 0,
  },
  searchMode: "hybrid",
  backdrop: true,
  themeConfig: {
    light: {},
    dark: {
      "--backdrop-bg-color": "#29282ee6",
    },
  },
};

export const SearchButtonParams: RegisterSearchButtonProps = {
  colorScheme: "dark",
  fullWidth: true,
  className:
    "group flex h-6 w-6 items-center justify-center sm:justify-start md:h-auto md:w-80 md:flex-none md:rounded-lg md:py-2.5 md:pl-4 md:pr-3.5 md:text-sm md:ring-1 md:ring-slate-200 md:hover:ring-slate-300 lg:w-96 dark:md:bg-slate-800/75 dark:md:ring-inset dark:md:ring-white/5 dark:md:hover:bg-slate-700/40 dark:md:hover:ring-slate-500",
};
