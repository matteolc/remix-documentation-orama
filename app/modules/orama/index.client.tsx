import type {
  RegisterSearchBoxProps,
  RegisterSearchButtonProps,
} from "@orama/searchbox";

export const SearchBoxParams: RegisterSearchBoxProps = {
  cloudConfig: {
    url: `https://cloud.orama.run/v1/indexes/remix-run-aixd3c`,
    key: "9hxktzDg25BvC8l1m3gV1vpF8RpIVOSj",
  },
  theme: "primary",
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
    light: {
      "--text-color-primary": "#54525B",
      "--text-color-secondary": "#302F33",
      "--text-color-tertiary": "#6D6B74",
      "--background-color-primary": "#ffffff",
      "--background-color-secondary": "#fafaff",
      "--background-color-tertiary": "#f6f2ff",
      "--border-color-primary": "#ccd5e0",
      "--border-color-secondary": "#71717A",
      "--border-color-accent": "#3451b2",
      "--background-color-fourth": "#f6f6f7",
      "--icon-color-primary": "#54525b",
      "--icon-color-secondary": "#6d6b74",
      "--backdrop-bg-color": "rgba(0, 0, 0, 0.50)",
    },
    dark: {
      "--text-color-primary": "#e2e8f0",
      "--text-color-secondary": "#71717a",
      "--text-color-tertiary": "#a1a1aa",
      "--background-color-primary": "#020617",
      "--background-color-secondary": "#0f172a",
      "--background-color-tertiary": "#1e293b",
      "--border-color-primary": "#27272a",
      "--border-color-secondary": "#71717A",
      "--border-color-accent": "#3451b2",
      "--icon-color-primary": "#d4d4d8",
      "--icon-color-secondary": "#71717a",
      "--backdrop-bg-color": "#29282ee6",
    },
  },
};

export const SearchButtonParams: RegisterSearchButtonProps = {
  fullWidth: true,
  themeConfig: {
    light: {
      "--search-btn-text-color": "#54525B",
      "--search-btn-text-color-hover": "#54525B",
      "--search-btn-text-color-focus": "#54525B",
      "--search-btn-background-color": "#f8fafc",
      "--search-btn-background-color-hover": "#FFFFFF",
      "--search-btn-background-color-focus": "#FFFFFF",
      "--search-btn-border-color": "transparent",
      "--search-btn-border-color-hover": "#a8b1ff",
      "--search-btn-border-color-focus": "#a8b1ff",
      "--search-btn-icon-color": "#71717A",
    },
    dark: {
      "--search-btn-text-color": "#D4D4D8",
      "--search-btn-text-color-hover": "#D4D4D8",
      "--search-btn-text-color-focus": "#D4D4D8",
      "--search-btn-background-color": "#09090B",
      "--search-btn-background-color-hover": "#09090B",
      "--search-btn-background-color-focus": "#09090B",
      "--search-btn-border-color": "transparent",
      "--search-btn-border-color-hover": "#a8b1ff",
      "--search-btn-border-color-focus": "#a8b1ff",
      "--search-btn-icon-color": "#71717A",
    },
  },
  className:
    "z-50 group flex h-6 w-6 items-center justify-center sm:justify-start h-auto md:w-80 md:flex-none rounded-lg text-sm ring-1 ring-slate-200 hover:ring-slate-300 lg:w-96 dark:bg-slate-800/75 dark:ring-inset dark:ring-white/5 dark:hover:bg-slate-700/40 dark:hover:ring-slate-500",
};
