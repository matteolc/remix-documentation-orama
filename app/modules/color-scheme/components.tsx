import { useLayoutEffect, useMemo } from "react";
import type { SerializeFrom } from "@remix-run/node";
import { useMatches, useNavigation } from "@remix-run/react";
import type { loader as rootLoader } from "../../root";
import type { ColorScheme } from "./types";

export function useColorScheme(): ColorScheme {
  const rootLoaderData = useMatches()[0].data as SerializeFrom<
    typeof rootLoader
  >;
  const { formData } = useNavigation();
  const optimisticColorScheme =
    formData && formData.has("colorScheme")
      ? (formData.get("colorScheme") as ColorScheme)
      : null;
  return optimisticColorScheme || rootLoaderData?.colorScheme;
}

export function ColorSchemeScript() {
  const colorScheme = useColorScheme();

  const script = useMemo(
    () => `
      const colorScheme = ${JSON.stringify(colorScheme)};
      if (colorScheme === "system") {
        const media = window.matchMedia("(prefers-color-scheme: dark)")
        if (media.matches) document.documentElement.classList.add("dark");
      }
    `,
    [] // eslint-disable-line
    // we don't want this script to ever change
  );

  if (typeof document !== "undefined") {
    // eslint-disable-next-line
    useLayoutEffect(() => {
      if (colorScheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (colorScheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (colorScheme === "system") {
        // eslint-disable-next-line no-inner-declarations
        function check(media: MediaQueryList) {
          if (media.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        check(media);

        // @ts-expect-error I can't figure out what TypeScript wants here ...
        media.addEventListener("change", check);
        // @ts-expect-error No overload matches this call
        return () => media.removeEventListener("change", check);
      } else {
        console.error("Impossible color scheme state:", colorScheme);
      }
    }, [colorScheme]);
  }

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
