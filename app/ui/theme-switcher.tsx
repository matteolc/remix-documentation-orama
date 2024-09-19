import { useSubmit, useFetcher } from "@remix-run/react";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import ComputerDesktopIcon from "@heroicons/react/24/outline/ComputerDesktopIcon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import { useEffect, useState } from "react";

import type { Theme, ThemeExtended } from "~/hooks/use-theme";
import { useOptimisticThemeMode } from "~/hooks/use-theme";
import { Listbox, ListboxLabel, ListboxOption } from "./listbox";

const THEME_ICON = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <ComputerDesktopIcon />,
};

function ThemeSwitcher({ userPreference }: { userPreference?: Theme | null }) {
  const submit = useSubmit();
  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? userPreference ?? "system";
  const themes: ThemeExtended[] = ["light", "dark", "system"];
  const [theme, setTheme] = useState<ThemeExtended>(mode);

  useEffect(() => {
    if (mode === theme) return;

    submit(
      { theme },
      {
        method: "POST",
        action: "/api/switch-theme",
        navigate: false,
        fetcherKey: "theme-fetcher",
      }
    );
  }, [mode, submit, theme]);

  return (
    <div
      className="flex min-w-36 items-center rounded-lg text-left text-base/6 font-medium text-zinc-950 sm:text-sm/5"
      aria-label="Toggle theme"
    >
      <Listbox name="theme" value={theme} onChange={setTheme}>
        {themes.map((theme) => (
          <ListboxOption key={theme} value={theme}>
            {THEME_ICON[theme]}
            <ListboxLabel>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    </div>
  );
}

function ThemeSwitcherHome() {
  const fetcher = useFetcher({ key: "theme-fetcher" });
  const themes: ThemeExtended[] = ["light", "dark", "system"];

  return (
    <fetcher.Form
      method="POST"
      action="/api/switch-theme"
      className="flex gap-2"
    >
      {themes.map((theme) => (
        <button
          key={theme}
          type="submit"
          name="theme"
          value={theme}
          className="h-4 w-4"
        >
          {THEME_ICON[theme]}
          <span className="sr-only">
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        </button>
      ))}
    </fetcher.Form>
  );
}

export { ThemeSwitcher, ThemeSwitcherHome };
