import {
  vitePlugin as remix,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools } from "remix-development-tools";
import { flatRoutes } from 'remix-flat-routes';

declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true; // 👈 enable _types_ for single-fetch
  }
}

export default defineConfig({
  plugins: [
    remixDevTools(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
      },
      ignoredRouteFiles: ['**/*'],
      serverModuleFormat: 'esm',
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: ['**/*.test.{js,jsx,ts,tsx}', '**/__*.*'],
        });
      },
    }),
    tsconfigPaths(),
  ],
});
