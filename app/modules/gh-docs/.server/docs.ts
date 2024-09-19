import { processMarkdown } from "~/modules/gh-docs/.server/md";
import LRUCache from "lru-cache";
import parseYamlHeader from "gray-matter";
import invariant from "tiny-invariant";
import { getRepoContent } from "./repo-content";
import { getRepoTarballStream } from "./repo-tarball";
import { createTarFileProcessor } from "./tarball";
import { load as $ } from "cheerio";

interface MenuDocAttributes {
  title: string;
  order?: number;
  new?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface MenuDoc {
  attrs: MenuDocAttributes;
  children: MenuDoc[];
  filename: string;
  hasContent: boolean;
  slug: string;
}

export interface Doc extends Omit<MenuDoc, "hasContent"> {
  html: string;
  headings: {
    headingLevel: string;
    html: string | null;
    slug: string | undefined;
  }[];
}

declare global {
  // eslint-disable-next-line no-var
  var menuCache: LRUCache<string, MenuDoc[]>;
  // eslint-disable-next-line no-var
  var docCache: LRUCache<string, Doc | undefined>;
}

const NO_CACHE = false;

global.menuCache ??= new LRUCache<string, MenuDoc[]>({
  // const menuCache = new LRUCache<string, MenuDoc[]>({
  max: 10,
  ttl: NO_CACHE ? 1 : 300000, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: async (cacheKey) => {
    console.log(`Fetching fresh menu: ${cacheKey}`);
    const [repo, ref] = cacheKey.split(":");
    const stream = await getRepoTarballStream(repo, ref);
    const menu = await getMenuFromStream(stream);
    return menu;
  },
});

export async function getMenu(
  repo: string,
  ref: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lang: string
): Promise<MenuDoc[] | undefined> {
  return menuCache.fetch(`${repo}:${ref}`);
}

function parseAttrs(
  md: string,
  filename: string
): { content: string; attrs: Doc["attrs"] } {
  const { data, content } = parseYamlHeader(md);
  return {
    content,
    attrs: {
      title: filename,
      ...data,
    },
  };
}

/**
 * While we're using HTTP caching, we have this memory cache too so that
 * document requests and data request to the same document can do less work for
 * new versions. This makes our origin server very fast, but adding HTTP caching
 * const's have simpler and faster deployments with just one origin server, but
 * still distribute the documents across the CDN.
 */
global.docCache ??= new LRUCache<string, Doc | undefined>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchDoc,
});

async function fetchDoc(key: string): Promise<Doc> {
  const [repo, ref, slug] = key.split(":");
  const filename = `${slug}.md`;
  const md = await getRepoContent(repo, ref, filename);
  if (md === null) {
    throw Error(`Could not find ${filename} in ${repo}@${ref}`);
  }
  const { html, attributes } = await processMarkdown(md);
  let attrs: MenuDocAttributes = { title: filename };
  if (isPlainObject(attributes)) {
    attrs = { title: filename, ...attributes };
  }

  // sorry, cheerio is so much easier than using rehype stuff.
  const headings = createTableOfContentsFromHeadings(html);
  return { attrs, filename, html, slug, headings, children: [] };
}

// create table of contents from h2 and h3 headings
function createTableOfContentsFromHeadings(html: string) {
  const $headings = $(html)("h2,h3");

  const headings = $headings.toArray().map((heading) => ({
    headingLevel: heading.name,
    html: $(heading)("a").remove().end().children().html(),
    slug: heading.attributes.find((attr) => attr.name === "id")?.value,
  }));

  return headings;
}

export async function getDoc(
  repo: string,
  ref: string,
  slug: string
): Promise<Doc | undefined> {
  const key = `${repo}:${ref}:${slug}`;
  const doc = await docCache.fetch(key);
  return doc;
}

/**
 * Exported for unit tests
 */
export async function getMenuFromStream(stream: NodeJS.ReadableStream) {
  const docs: MenuDoc[] = [];
  const processFiles = createTarFileProcessor(stream);
  await processFiles(async ({ filename, content }) => {
    const { attrs, content: md } = parseAttrs(content, filename);
    const slug = makeSlug(filename);

    // don't need docs/index.md in the menu
    if (slug === "") return;

    // can have docs not in the menu
    if (attrs.hidden) return;

    docs.push({
      attrs,
      filename,
      slug: makeSlug(filename),
      hasContent: md.length > 0,
      children: [],
    });
  });

  // sort so we can process parents before children
  docs.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  // construct the hierarchy
  const tree: MenuDoc[] = [];
  const map = new Map<string, MenuDoc>();
  for (const doc of docs) {
    const { slug } = doc;

    const parentSlug = slug.substring(0, slug.lastIndexOf("/"));
    map.set(slug, doc);

    if (parentSlug) {
      const parent = map.get(parentSlug);
      invariant(parent, `Expected ${parentSlug} in tree`);
      parent.children.push(doc);
    } else {
      tree.push(doc);
    }
  }

  const sortDocs = (a: MenuDoc, b: MenuDoc) =>
    (a.attrs.order || Infinity) - (b.attrs.order || Infinity);

  // sort the parents and children
  tree.sort(sortDocs);
  for (const category of tree) {
    category.children.sort(sortDocs);
  }

  return tree;
}

/**
 * Removes the extension from markdown file names.
 */
function makeSlug(docName: string): string {
  // Could be as simple as `/^docs\//` but local development tarballs have more
  // path in front of "docs/", so grab any of that stuff too. Maybe there's a
  // way to control the basename of files when we make the local tarball but I
  // dunno how to do that right now.
  return docName
    .replace(/^(.+\/)?docs\//, "")
    .replace(/\.md$/, "")
    .replace(/index$/, "")
    .replace(/\/$/, "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(obj: unknown): obj is Record<keyof any, unknown> {
  return !!obj && Object.prototype.toString.call(obj) === "[object Object]";
}
