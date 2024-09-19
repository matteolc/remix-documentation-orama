import { createCookie, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import type { ColorScheme } from "./types";

const cookie = createCookie("color-scheme", {
  maxAge: 34560000,
  sameSite: "lax",
});

export async function parseColorScheme(request: Request) {
  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);
  return vals ? vals.colorScheme : "system";
}

function serializeColorScheme(colorScheme: "dark" | "light" | "system") {
  const eatCookie = colorScheme === "system";
  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ colorScheme });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateColorScheme(formValue: any): formValue is ColorScheme {
  return (
    formValue === "dark" || formValue === "light" || formValue === "system"
  );
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const colorScheme = formData.get("colorScheme");
  const returnTo = safeRedirect(formData.get("returnTo"));

  if (!validateColorScheme(colorScheme)) {
    throw new Response("Bad Request", { status: 400 });
  }

  return redirect(returnTo || "/", {
    headers: { "Set-Cookie": await serializeColorScheme(colorScheme) },
  });
};

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined
) {
  if (!to || typeof to !== "string") {
    return "/";
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return "/";
  }

  return to;
}
