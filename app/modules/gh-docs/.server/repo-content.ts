import fsp from "fs/promises";
import invariant from "tiny-invariant";
import path from "path";

/**
 * Fetches the contents of a file in a repository or from your local disk.
 *
 * @param ref The GitHub ref, use `"local"` for local docs development
 * @param filepath The filepath inside the repo (including "docs/")
 * @returns The text of the file
 */
export async function getRepoContent(
  repoPair: string,
  ref: string,
  filepath: string
): Promise<string | null> {
  if (ref === "local") return getLocalContent(filepath);
  const [owner, repo] = repoPair.split("/");
  const pathname = `/${owner}/${repo}/${ref}/${filepath}`;
  const response = await fetch(
    new URL(pathname, "https://raw.githubusercontent.com/").href,
    { headers: { "User-Agent": `docs:${owner}/${repo}` } }
  );
  if (!response.ok) return null;
  return await response.text();
}

/**
 * Reads a single file from your local source repository
 */
async function getLocalContent(filepath: string): Promise<string> {
  invariant(
    process.env.LOCAL_REPO_RELATIVE_PATH,
    "Expected LOCAL_REPO_RELATIVE_PATH"
  );
  const localFilePath = path.join(process.env.LOCAL_REPO_RELATIVE_PATH, filepath);
  const content = await fsp.readFile(localFilePath);
  return content.toString();
}
