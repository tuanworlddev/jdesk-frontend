"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEARCH_INDEX, type SearchEntry } from "../docs/search-index";
import { apiGet } from "../lib/api";

type DocListItem = {
  slug: string;
  title: string;
  description: string;
  group: string;
};
import { useModalDialog } from "../hooks/use-modal-dialog";

function scoreEntry(entry: SearchEntry, terms: string[]): number {
  const hay = `${entry.title} ${entry.group} ${entry.keywords}`.toLowerCase();
  const title = entry.title.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return -1; // every term must match somewhere
    if (title.startsWith(t)) score += 5;
    else if (title.includes(t)) score += 3;
    else score += 1;
  }
  return score;
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<SearchEntry[]>(SEARCH_INDEX);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Build the index from the CMS documents; fall back to the static index.
  useEffect(() => {
    apiGet<DocListItem[]>("/documents")
      .then((docs) => {
        if (!docs.length) return;
        setEntries(
          docs.map((d) => ({
            title: d.title,
            href: `/docs/${d.slug}`,
            group: d.group,
            keywords: d.description,
          })),
        );
      })
      .catch(() => {
        /* keep the static fallback */
      });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    const terms = q.split(/\s+/);
    return entries
      .map((e) => ({ e, s: scoreEntry(e, terms) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.e);
  }, [query, entries]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const openDialog = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  useModalDialog({
    open,
    onClose: close,
    dialogRef,
    triggerRef,
    initialFocusRef: inputRef,
  });

  // Global ⌘K / Ctrl+K to open or close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else openDialog();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open, openDialog]);

  // Keep the active row in view.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-label="Search documentation"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="docs-search-dialog"
        className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-2.5 text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        <SearchIcon />
        <span className="hidden text-sm lg:inline">Search</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-faint lg:flex">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div className="absolute left-1/2 top-[12vh] w-[92vw] max-w-xl -translate-x-1/2">
            <div
              ref={dialogRef}
              id="docs-search-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="docs-search-title"
              tabIndex={-1}
              className="overflow-hidden rounded-2xl border border-line-strong bg-bg shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <SearchIcon />
                <span id="docs-search-title" className="sr-only">
                  Search documentation
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="Search the docs…"
                  role="combobox"
                  aria-label="Search documentation"
                  aria-autocomplete="list"
                  aria-expanded="true"
                  aria-controls="docs-search-results"
                  aria-activedescendant={
                    results[active] ? `docs-search-option-${active}` : undefined
                  }
                  className="no-focus-ring h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-faint"
                />
                <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-faint">
                  Esc
                </kbd>
              </div>

              <ul
                ref={listRef}
                id="docs-search-results"
                role="listbox"
                aria-label="Documentation results"
                className="max-h-[56vh] overflow-y-auto p-2"
              >
                {results.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-fg-muted">
                    No matches for “{query}”.
                  </li>
                )}
                {results.map((entry, i) => (
                  <li
                    key={entry.href}
                    id={`docs-search-option-${i}`}
                    data-idx={i}
                    role="option"
                    aria-selected={active === i}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(entry.href)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        active === i ? "bg-surface-2" : ""
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 place-items-center items-center justify-center rounded-md border ${
                            active === i
                              ? "border-arc/40 text-arc-strong"
                              : "border-line text-fg-faint"
                          }`}
                        >
                          <DocIcon />
                        </span>
                        <span className="text-sm font-medium text-fg">
                          {entry.title}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-fg-faint">
                        {entry.group}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[0.65rem] text-fg-faint">
                <span className="flex items-center gap-1">
                  <Key>↑</Key>
                  <Key>↓</Key> navigate
                </span>
                <span className="flex items-center gap-1">
                  <Key>↵</Key> open
                </span>
                <span className="flex items-center gap-1">
                  <Key>esc</Key> close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-fg-muted">
      {children}
    </kbd>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h8l4 4v14H6V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
