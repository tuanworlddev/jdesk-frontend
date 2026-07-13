import Link from "next/link";
import type { ReactNode } from "react";
import { siblings } from "../nav";
import { Toc, type TocItem } from "./toc";

export function DocArticle({
  eyebrow,
  title,
  description,
  href,
  toc = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  toc?: TocItem[];
  children: ReactNode;
}) {
  const { prev, next } = siblings(href);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0 py-8 lg:py-10">
        <header>
          <div className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-arc-strong">
            {eyebrow}
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-fg">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            {description}
          </p>
          <div className="bridge-rule mt-8" />
        </header>

        <div className="prose mt-8">{children}</div>

        <nav className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={prev.href}
              className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
            >
              <div className="text-xs text-fg-faint">Previous</div>
              <div className="mt-1 font-medium text-fg group-hover:text-arc-strong">
                ← {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group rounded-xl border border-line bg-surface p-4 text-right transition-colors hover:border-line-strong"
            >
              <div className="text-xs text-fg-faint">Next</div>
              <div className="mt-1 font-medium text-fg group-hover:text-arc-strong">
                {next.title} →
              </div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <div className="hidden lg:block">
        <Toc items={toc} />
      </div>
    </div>
  );
}
