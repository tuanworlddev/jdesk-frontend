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
import { fetchDoc, fetchDocsNav, siblingsOf } from "../../lib/docs";

// Docs render from the CMS database on each request, so admin edits go live.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchDoc(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
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

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doc, { flat }] = await Promise.all([fetchDoc(slug), fetchDocsNav()]);
  if (!doc) notFound();

  const { prev, next } = siblingsOf(flat, `/docs/${doc.slug}`);

  return (
    <DocArticle
      eyebrow={doc.eyebrow || doc.group}
      title={doc.title}
      description={doc.description}
      toc={tocFrom(doc.content)}
      prev={prev}
      next={next}
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
        {doc.content}
      </ReactMarkdown>
    </DocArticle>
  );
}
