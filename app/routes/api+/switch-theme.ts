import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";

import { ThemeSchema, setTheme } from "~/hooks/use-theme";

async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());
  const { theme } = ThemeSchema.parse(formData);

  const responseInit = {
    headers: { "Set-Cookie": setTheme(theme) },
  };

  return new Response(null, responseInit);
}

const loader: LoaderFunction = async () => {
  return new Response(null);
};

export { action, loader };
