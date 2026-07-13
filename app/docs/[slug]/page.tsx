import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DocArticle } from "../_components/doc-article";
import {
  STANDALONE_DOCS,
  STANDALONE_DOC_BY_SLUG,
} from "../standalone-docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return STANDALONE_DOCS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = STANDALONE_DOC_BY_SLUG.get(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

function markdownFor(slug: string) {
  return readFileSync(
    path.join(process.cwd(), "content", "docs", `${slug}.md`),
    "utf8",
  );
}

function plainText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement(child)) {
        return plainText(
          (child as ReactElement<{ children?: ReactNode }>).props.children,
        );
      }
      return "";
    })
    .join("");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function tocFrom(markdown: string) {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => {
    const label = match[1]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[~*_]/g, "");
    return { id: slugify(label), label };
  });
}

export default async function StandaloneDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = STANDALONE_DOC_BY_SLUG.get(slug);
  if (!doc) notFound();

  const markdown = markdownFor(slug);
  return (
    <DocArticle
      eyebrow={doc.group}
      title={doc.title}
      description={doc.description}
      href={`/docs/${doc.slug}`}
      toc={tocFrom(markdown)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = slugify(plainText(children));
            return (
              <h2 id={id} className="group scroll-mt-24">
                <a href={`#${id}`} className="no-underline">
                  {children}
                  <span className="ml-2 text-arc opacity-0 transition-opacity group-hover:opacity-100">
                    #
                  </span>
                </a>
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = slugify(plainText(children));
            return <h3 id={id}>{children}</h3>;
          },
          a: ({ href = "", children }) => {
            const external = /^(?:https?:|mailto:)/.test(href);
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="not-prose my-6 max-w-full overflow-x-auto rounded-xl border border-line">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </DocArticle>
  );
}
