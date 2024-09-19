import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getLatestVersion, getTags } from "./tags";
import invariant from "tiny-invariant";

export { validateParams } from "./params";
export { getRepoTarballStream } from "./repo-tarball";

export type { Doc } from "./docs";

const { REPO } = process.env;

export function getRepoTags() {
  invariant(REPO, "Expected REPO");
  return getTags(REPO);
}

export function getRepoBranches() {
  invariant(REPO, "Expected REPO");
  return getBranches(REPO);
}

export async function getLatestRepoTag(): Promise<string> {
  invariant(REPO, "Expected REPO");
  const tags = await getTags(REPO);
  invariant(tags, "Expected tags in getLatestRepoTag");
  return getLatestVersion(tags);
}

export function getRepoDocsMenu(ref: string, lang: string) {
  invariant(REPO, "Expected REPO");
  return getMenu(REPO, fixupRefName(ref), lang);
}

export async function getRepoDoc(ref: string, slug: string) {
  invariant(REPO, "Expected REPO");
  return await getDoc(REPO, fixupRefName(ref), slug);
}

function fixupRefName(ref: string) {
  return ["dev", "main", "release-next", "local"].includes(ref) ||
    // when we switched to changesets the `v` went away, so we use that as a way
    // to know if we need to add hte `react-router@` prefix for interacting w/
    // github.
    ref.startsWith("v")
    ? ref
    : `react-router@${ref}`;
}
