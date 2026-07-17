import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Render admin-authored Markdown to HTML. Content is authored by the
 * authenticated admin (trusted), then styled by the `.prose` class.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}

function plainMarkdownHeading(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[\\*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

/**
 * The page shell already renders the CMS title as its H1. Standalone Markdown
 * often repeats that title, so remove only an equivalent leading ATX H1 to
 * keep a single document heading without discarding meaningful content.
 */
export function stripLeadingDocumentTitle(
  markdown: string,
  title: string,
): string {
  const source = markdown ?? "";
  const match = source.match(
    /^(?:\uFEFF)?(?:[ \t]*(?:\r?\n|$))*#[ \t]+([^\r\n]*?)[ \t]*#*[ \t]*(?:\r?\n|$)/,
  );

  if (!match || plainMarkdownHeading(match[1]) !== plainMarkdownHeading(title)) {
    return source;
  }

  return source.slice(match[0].length).replace(/^(?:[ \t]*\r?\n)+/, "");
}
