import * as semver from "semver";
import type { LanguageCode } from "iso-639-1";
import iso_639_1 from "iso-639-1";

const CODES = iso_639_1.getAllCodes();

export function validateParams(
  tags: string[],
  branches: string[],
  params: { lang: string; ref?: string; ["*"]?: string },
  lang: string = "en"
): string | null {
  const { lang: first, ref: second, "*": splat } = params;

  const firstIsLang = CODES.includes(first as LanguageCode);
  const secondIsRef =
    second && (tags.includes(second) || branches.includes(second));

  if (firstIsLang) {
    if (!second) {
      return `${first}/${semver.maxSatisfying(tags, "*", {
        includePrerelease: false,
      })}`;
    }

    if (!secondIsRef) {
      const expandedRef = semver.maxSatisfying(tags, second, {
        includePrerelease: false,
      });
      const latest = semver.maxSatisfying(tags, "*");
      const path = [first];

      if (expandedRef) path.push(expandedRef);
      else if (latest) path.push(latest, second);

      if (splat) path.push(splat);
      return path.join("/");
    }
  }

  const ref =
    tags.includes(first) || branches.includes(first)
      ? first
      : semver.maxSatisfying(tags, first, { includePrerelease: false });
  if (ref) {
    const path = [lang, ref];
    if (second) path.push(second);
    if (splat) path.push(splat);
    return path.join("/");
  }

  if (!firstIsLang && !ref) {
    const path = [
      lang,
      semver.maxSatisfying(tags, "*", { includePrerelease: false }),
      first,
    ];
    if (second) path.push(second);
    if (splat) path.push(splat);
    return path.join("/");
  }

  return null;
}
