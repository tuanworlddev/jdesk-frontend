import type { ReactNode } from "react";

/** A section heading that is also a scroll/anchor target for the TOC. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
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
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24">
      {children}
    </h3>
  );
}

/** Two code blocks (or any nodes) side by side on wide screens. */
export function Split({ children }: { children: ReactNode }) {
  return <div className="not-prose grid gap-4 lg:grid-cols-2">{children}</div>;
}

/** A compact key/value reference row list. */
export function DefList({
  items,
}: {
  items: { term: string; def: ReactNode }[];
}) {
  return (
    <dl className="not-prose my-6 divide-y divide-line overflow-hidden rounded-xl border border-line">
      {items.map((it) => (
        <div
          key={it.term}
          className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr] sm:gap-4"
        >
          <dt className="font-mono text-sm text-arc-strong">{it.term}</dt>
          <dd className="text-sm text-fg-muted">{it.def}</dd>
        </div>
      ))}
    </dl>
  );
}
