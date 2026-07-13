"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-8 pl-4">
      <div className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-faint">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`-ml-px block border-l-2 py-0.5 pl-4 text-sm transition-colors ${
                active === item.id
                  ? "border-arc text-fg"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
