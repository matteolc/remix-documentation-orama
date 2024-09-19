/*!
 * Forked from https://github.com/ryanflorence/md/blob/master/index.ts
 *
 * Adapted from
 * - ggoodman/nostalgie
 *   - MIT https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/LICENSE
 *   - https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/src/worker/mdxCompiler.ts
 */
import { getHighlighter, toShikiTheme } from "shiki";
import rangeParser from "parse-numeric-range";
import parseFrontMatter from "front-matter";
import type * as Hast from "hast";
import type * as Unist from "unist";
import type * as Shiki from "shiki";
import type * as Unified from "unified";
import themeJson from "../../../../data/base16.json";

export interface ProcessorOptions {
  resolveHref?(href: string): string;
}

let processor: Awaited<ReturnType<typeof getProcessor>>;
export async function processMarkdown(
  content: string,
  options?: ProcessorOptions
) {
  processor = processor || (await getProcessor(options));
  const { attributes, body: raw } = parseFrontMatter(content);
  const vfile = await processor.process(raw);
  const html = vfile.value.toString();
  return { attributes, raw, html };
}

export async function getProcessor(options?: ProcessorOptions) {
  const [
    { unified },
    { default: remarkGfm },
    { default: remarkParse },
    { default: remarkRehype },
    { default: rehypeSlug },
    { default: rehypeStringify },
    { default: rehypeAutolinkHeadings },
    plugins,
  ] = await Promise.all([
    import("unified"),
    import("remark-gfm"),
    import("remark-parse"),
    import("remark-rehype"),
    import("rehype-slug"),
    import("rehype-stringify"),
    import("rehype-autolink-headings"),
    loadPlugins(),
  ]);

  return unified()
    .use(remarkParse)
    .use(plugins.stripLinkExtPlugin, options)
    .use(plugins.remarkCodeBlocksShiki, options)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings);
}

type InternalPlugin<
  Input extends string | Unist.Node | undefined,
  Output
> = Unified.Plugin<[ProcessorOptions?], Input, Output>;

export async function loadPlugins() {
  const [{ visit, SKIP }, { htmlEscape }] = await Promise.all([
    import("unist-util-visit"),
    import("escape-goat"),
  ]);

  const stripLinkExtPlugin: InternalPlugin<UnistNode.Root, UnistNode.Root> = (
    options = {}
  ) => {
    return async function transformer(tree: UnistNode.Root) {
      visit(tree, "link", (node, index, parent) => {
        if (
          options.resolveHref &&
          typeof node.url === "string" &&
          isRelativeUrl(node.url)
        ) {
          if (parent && index != null) {
            parent.children[index] = {
              ...node,
              url: options.resolveHref(node.url),
            };
            return SKIP;
          }
        }
      });
    };
  };

  const remarkCodeBlocksShiki: InternalPlugin<
    UnistNode.Root,
    UnistNode.Root
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  > = (options) => {
    let theme: Awaited<ReturnType<typeof toShikiTheme>>;
    let highlighter: Awaited<ReturnType<typeof getHighlighter>>;

    return async function transformer(tree: UnistNode.Root) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      theme = theme || toShikiTheme(themeJson as any);
      highlighter = highlighter || (await getHighlighter({ themes: [theme] }));
      const fgColor = convertFakeHexToCustomProp(
        highlighter.getForegroundColor(theme.name) || ""
      );
      const langs: Shiki.Lang[] = [
        "js",
        "json",
        "jsx",
        "ts",
        "tsx",
        "markdown",
        "shellscript",
        "html",
        "css",
        "diff",
        "mdx",
        "prisma",
      ];
      const langSet = new Set(langs);
      const transformTasks: Array<() => Promise<void>> = [];

      visit(tree, "code", (node) => {
        if (
          !node.lang ||
          !node.value ||
          !langSet.has(node.lang as Shiki.Lang)
        ) {
          return;
        }

        if (node.lang === "js") node.lang = "javascript";
        if (node.lang === "ts") node.lang = "typescript";
        const language = node.lang;
        const code = node.value;
        const {
          addedLines,
          highlightLines,
          nodeProperties,
          removedLines,
          startingLineNumber,
          usesLineNumbers,
        } = getCodeBlockMeta();

        transformTasks.push(highlightNodes);
        return SKIP;

        async function highlightNodes() {
          const tokens = getThemedTokens({ code, language });
          const children = tokens.map(
            (lineTokens, zeroBasedLineNumber): Hast.Element => {
              const children = lineTokens.map(
                (token): Hast.Text | Hast.Element => {
                  const color = convertFakeHexToCustomProp(token.color || "");
                  const content: Hast.Text = {
                    type: "text",
                    // Do not escape the _actual_ content
                    value: token.content,
                  };

                  return color && color !== fgColor
                    ? {
                        type: "element",
                        tagName: "span",
                        properties: {
                          style: `color: ${htmlEscape(color)}`,
                        },
                        children: [content],
                      }
                    : content;
                }
              );

              children.push({
                type: "text",
                value: "\n",
              });

              const isDiff = addedLines.length > 0 || removedLines.length > 0;
              let diffLineNumber = startingLineNumber - 1;
              const lineNumber = zeroBasedLineNumber + startingLineNumber;
              const highlightLine = highlightLines?.includes(lineNumber);
              const removeLine = removedLines.includes(lineNumber);
              const addLine = addedLines.includes(lineNumber);
              if (!removeLine) {
                diffLineNumber++;
              }

              return {
                type: "element",
                tagName: "span",
                properties: {
                  className: "codeblock-line",
                  dataHighlight: highlightLine ? "true" : undefined,
                  dataLineNumber: usesLineNumbers ? lineNumber : undefined,
                  dataAdd: isDiff ? addLine : undefined,
                  dataRemove: isDiff ? removeLine : undefined,
                  dataDiffLineNumber: isDiff ? diffLineNumber : undefined,
                },
                children,
              };
            }
          );

          const nodeValue = {
            type: "element",
            tagName: "pre",
            properties: {
              ...nodeProperties,
              dataLineNumbers: usesLineNumbers ? "true" : "false",
              dataLang: htmlEscape(language),
              style: `color: ${htmlEscape(fgColor)};`,
            },
            children: [
              {
                type: "element",
                tagName: "code",
                children,
              },
            ],
          };

          const data = node.data ?? {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).type = "element";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).tagName = "div";
          const properties =
            data.hProperties && typeof data.hProperties === "object"
              ? data.hProperties
              : {};
          data.hProperties = {
            ...properties,
            dataCodeBlock: "",
            ...nodeProperties,
            dataLineNumbers: usesLineNumbers ? "true" : "false",
            dataLang: htmlEscape(language),
          };
          data.hChildren = [nodeValue];
          node.data = data;
        }

        function getCodeBlockMeta() {
          // TODO: figure out how this is ever an array?
          const meta = Array.isArray(node.meta) ? node.meta[0] : node.meta;

          let metaParams = new URLSearchParams();
          if (meta) {
            const linesHighlightsMetaShorthand = meta.match(/^\[(.+)\]$/);
            if (linesHighlightsMetaShorthand) {
              metaParams.set("lines", linesHighlightsMetaShorthand[0]);
            } else {
              metaParams = new URLSearchParams(meta.split(/\s+/).join("&"));
            }
          }

          const addedLines = parseLineHighlights(metaParams.get("add"));
          const removedLines = parseLineHighlights(metaParams.get("remove"));
          const highlightLines = parseLineHighlights(metaParams.get("lines"));
          const startValNum = metaParams.has("start")
            ? Number(metaParams.get("start"))
            : 1;
            const startingLineNumber = Number.isFinite(startValNum)
            ? startValNum
            : 1;
            const usesLineNumbers = !metaParams.has("nonumber");

            const nodeProperties: { [key: string]: string } = {};
          metaParams.forEach((val, key) => {
            if (key === "lines") return;
            nodeProperties[`data-${key}`] = val;
          });

          return {
            addedLines,
            highlightLines,
            nodeProperties,
            removedLines,
            startingLineNumber,
            usesLineNumbers,
          };
        }
      });

      await Promise.all(transformTasks.map((exec) => exec()));

      function getThemedTokens({
        code,
        language,
      }: {
        code: string;
        language: Shiki.Lang;
      }) {
        return highlighter.codeToThemedTokens(code, language, theme.name, {
          includeExplanation: false,
        });
      }
    };
  };

  return {
    stripLinkExtPlugin,
    remarkCodeBlocksShiki,
  };
}

////////////////////////////////////////////////////////////////////////////////

function parseLineHighlights(param: string | null) {
  if (!param) return [];
  const range = param.match(/^\[(.+)\]$/);
  if (!range) return [];
  return rangeParser(range[1]);
}

// The theme actually stores #FFFF${base-16-color-id} because vscode-textmate
// requires colors to be valid hex codes, if they aren't, it changes them to a
// default, so this is a mega hack to trick it.
function convertFakeHexToCustomProp(color: string) {
  return color.replace(/^#FFFF(.+)/, "var(--base$1)");
}

function isRelativeUrl(test: string) {
  // Probably fragile but should work well enough.
  // It would be nice if the consumer could provide a baseURI we could do
  // something like:
  // new URL(baseURI).origin === new URL(test, baseURI).origin
  const regexp = new RegExp("^(?:[a-z]+:)?//", "i");
  return !regexp.test(test);
}

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UnistNode {
  export type Content = Flow | Phrasing | Html;
  export interface Root extends Unist.Parent {
    type: "root";
    children: Flow[];
  }

  export type Flow =
    | Blockquote
    | Heading
    | ParagraphNode
    | Link
    | Pre
    | Code
    | Image
    | Element
    | Html;

  export interface Html extends Unist.Node {
    type: "html";
    value: string;
  }

  export interface Element extends Unist.Parent {
    type: "element";
    tagName?: string;
  }

  export interface CodeElement extends Element {
    tagName: "code";
    data?: {
      meta?: string;
    };
    properties?: {
      className?: string[];
    };
  }

  export interface PreElement extends Element {
    tagName: "pre";
  }

  export interface Image extends Unist.Node {
    type: "image";
    title: null;
    url: string;
    alt?: string;
  }

  export interface Blockquote extends Unist.Parent {
    type: "blockquote";
    children: Flow[];
  }

  export interface Heading extends Unist.Parent {
    type: "heading";
    depth: number;
    children: UnistNode.Phrasing[];
  }

  interface ParagraphNode extends Unist.Parent {
    type: "paragraph";
    children: Phrasing[];
  }

  export interface Pre extends Unist.Parent {
    type: "pre";
    children: Phrasing[];
  }

  export interface Code extends Unist.Parent {
    type: "code";
    value?: string;
    lang?: Shiki.Lang;
    meta?: string | string[];
  }

  export type Phrasing = Text | Emphasis;

  export interface Emphasis extends Unist.Parent {
    type: "emphasis";
    children: Phrasing[];
  }

  export interface Link extends Unist.Parent {
    type: "link";
    children: Flow[];
    url?: string;
  }

  export interface Text extends Unist.Literal {
    type: "text";
    value: string;
  }
}
