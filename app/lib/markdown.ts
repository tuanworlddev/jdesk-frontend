import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Render admin-authored Markdown to HTML. Content is authored by the
 * authenticated admin (trusted), then styled by the `.prose` class.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}
