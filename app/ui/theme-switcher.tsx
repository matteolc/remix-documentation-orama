import { useSubmit, useFetcher } from "@remix-run/react";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import ComputerDesktopIcon from "@heroicons/react/24/outline/ComputerDesktopIcon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import { useEffect, useState } from "react";

import type { Theme, ThemeExtended } from "~/hooks/use-theme";
import { useOptimisticThemeMode } from "~/hooks/use-theme";
import { Listbox, ListboxLabel, ListboxOption } from "./listbox";
import clsx from "clsx";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

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

function ThemeSwitcherVercel({
  userPreference,
}: {
  userPreference?: Theme | null;
}) {
  const fetcher = useFetcher({ key: "theme-fetcher" });
  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? userPreference ?? "system";

  return (
    <fieldset className="text-slate-400 flex rounded-full h-[32px] w-fit p-0 border-0 m-0 shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:shadow-[0_0_0_1px_hsla(0,0%,100%,.145)]">
      <legend className="sr-only">Select a display theme:</legend>
      <span className="h-full">
        <input
          aria-label="system"
          id="theme-switch-system-:r1c3:"
          type="radio"
          value="system"
          className="appearance-none p-0 absolute outline-none m-0"
          checked={mode === "system"}
          onChange={() => {
            fetcher.submit(
              { theme: "system" },
              { action: "/api/switch-theme", method: "post" }
            );
          }}
        />
        <label
          htmlFor="theme-switch-system-:r1c3:"
          className={clsx(
            mode === "system" &&
              "shadow-[0_0_0_1px_hsla(0,0%,18%,1),0_1px_2px_0_hsla(0,0%,100%,.06)] text-[hsla(0,0%,93%,1)] bg-slate-700",
            "group dark:hover:text-[hsla(0,0%,93%,1)] hover:text-black rounded-full flex items-center justify-center bg-none h-[32px] w-[32px] m-0 cursor-pointer relative transition-colors ease-in duration-100"
          )}
        >
          <span className="sr-only">system</span>
          <svg
            height="16"
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width="16"
            style={{ color: "currentcolor" }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1 3.25C1 1.45507 2.45507 0 4.25 0H11.75C13.5449 0 15 1.45507 15 3.25V15.25V16H14.25H1.75H1V15.25V3.25ZM4.25 1.5C3.2835 1.5 2.5 2.2835 2.5 3.25V14.5H13.5V3.25C13.5 2.2835 12.7165 1.5 11.75 1.5H4.25ZM4 4C4 3.44772 4.44772 3 5 3H11C11.5523 3 12 3.44772 12 4V10H4V4ZM9 13H12V11.5H9V13Z"
              fill="currentColor"
            ></path>
          </svg>
        </label>
      </span>
      <span className="h-full">
        <input
          aria-label="light"
          id="theme-switch-light-:r1c3:"
          className="appearance-none p-0 absolute outline-none m-0 checked:text-slate-50 checked:bg-slate-950 checked:drop-shadow-md checked:shadow-slate-400"
          type="radio"
          value="light"
          checked={mode === "light"}
          onChange={() => {
            fetcher.submit(
              { theme: "light" },
              { action: "/api/switch-theme", method: "post" }
            );
          }}
        />
        <label
          htmlFor="theme-switch-light-:r1c3:"
          className={clsx(
            mode === "light" &&
              "shadow-[0_0_0_1px_hsla(0,0%,92%,1),0_1px_2px_0_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_hsla(0,0%,18%,1),0_1px_2px_0_hsla(0,0%,100%,.06)] dark:text-[hsla(0,0%,93%,1)] dark:bg-slate-700",
            "rounded-full dark:hover:text-[hsla(0,0%,93%,1)] hover:text-black flex items-center justify-center bg-none h-[32px] w-[32px] m-0 cursor-pointer relative transition-colors ease-in duration-100"
          )}
        >
          <span className="sr-only">light</span>
          <svg
            height="16"
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width="16"
            style={{ color: "currentcolor" }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.75 0.75V0H7.25V0.75V2V2.75H8.75V2V0.75ZM11.182 3.75732L11.7123 3.22699L12.0659 2.87344L12.5962 2.34311L13.6569 3.40377L13.1265 3.9341L12.773 4.28765L12.2426 4.81798L11.182 3.75732ZM8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 6.61929 9.38071 5.5 8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5ZM8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12ZM13.25 7.25H14H15.25H16V8.75H15.25H14H13.25V7.25ZM0.75 7.25H0V8.75H0.75H2H2.75V7.25H2H0.75ZM2.87348 12.0659L2.34315 12.5962L3.40381 13.6569L3.93414 13.1265L4.28769 12.773L4.81802 12.2426L3.75736 11.182L3.22703 11.7123L2.87348 12.0659ZM3.75735 4.81798L3.22702 4.28765L2.87347 3.9341L2.34314 3.40377L3.4038 2.34311L3.93413 2.87344L4.28768 3.22699L4.81802 3.75732L3.75735 4.81798ZM12.0659 13.1265L12.5962 13.6569L13.6569 12.5962L13.1265 12.0659L12.773 11.7123L12.2426 11.182L11.182 12.2426L11.7123 12.773L12.0659 13.1265ZM8.75 13.25V14V15.25V16H7.25V15.25V14V13.25H8.75Z"
              fill="currentColor"
            ></path>
          </svg>
        </label>
      </span>
      <span className="h-full">
        <input
          aria-label="dark"
          id="theme-switch-dark-:r1c3:"
          className="appearance-none p-0 absolute outline-none m-0"
          type="radio"
          value="dark"
          checked={mode === "dark"}
          onChange={() => {
            fetcher.submit(
              { theme: "dark" },
              { action: "/api/switch-theme", method: "post" }
            );
          }}
        />
        <label
          htmlFor="theme-switch-dark-:r1c3:"
          className={clsx(
            mode === "dark" &&
              "shadow-[0_0_0_1px_hsla(0,0%,18%,1),0_1px_2px_0_hsla(0,0%,100%,.06)] text-[hsla(0,0%,93%,1)] bg-slate-700",
            "rounded-full dark:hover:text-[hsla(0,0%,93%,1)] hover:text-black flex items-center justify-center bg-none h-[32px] w-[32px] m-0 cursor-pointer relative transition-colors ease-in duration-100"
          )}
        >
          <span className="sr-only">dark</span>
          <svg
            height="16"
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width="16"
            style={{ color: "currentcolor" }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.5 8.00005C1.5 5.53089 2.99198 3.40932 5.12349 2.48889C4.88136 3.19858 4.75 3.95936 4.75 4.7501C4.75 8.61609 7.88401 11.7501 11.75 11.7501C11.8995 11.7501 12.048 11.7454 12.1953 11.7361C11.0955 13.1164 9.40047 14.0001 7.5 14.0001C4.18629 14.0001 1.5 11.3138 1.5 8.00005ZM6.41706 0.577759C2.78784 1.1031 0 4.22536 0 8.00005C0 12.1422 3.35786 15.5001 7.5 15.5001C10.5798 15.5001 13.2244 13.6438 14.3792 10.9921L13.4588 9.9797C12.9218 10.155 12.3478 10.2501 11.75 10.2501C8.71243 10.2501 6.25 7.78767 6.25 4.7501C6.25 3.63431 6.58146 2.59823 7.15111 1.73217L6.41706 0.577759ZM13.25 1V1.75V2.75L14.25 2.75H15V4.25H14.25H13.25V5.25V6H11.75V5.25V4.25H10.75L10 4.25V2.75H10.75L11.75 2.75V1.75V1H13.25Z"
              fill="currentColor"
            ></path>
          </svg>
        </label>
      </span>
    </fieldset>
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

export { ThemeSwitcher, ThemeSwitcherHome, ThemeSwitcherVercel };
