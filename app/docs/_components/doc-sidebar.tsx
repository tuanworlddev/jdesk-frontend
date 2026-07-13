"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useModalDialog } from "../../hooks/use-modal-dialog";
import { DOCS_NAV } from "../nav";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-7">
      {DOCS_NAV.map((group) => (
        <div key={group.title}>
          <div className="mb-2 px-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-faint">
            {group.title}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-surface-2 font-medium text-fg"
                        : "text-fg-muted hover:bg-surface-2/60 hover:text-fg"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-ember to-arc" />
                    )}
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocSidebar() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useModalDialog({
    open,
    onClose: close,
    dialogRef: drawerRef,
    triggerRef,
    initialFocusRef: closeRef,
  });

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-4">
          <NavList />
        </div>
      </aside>

      {/* Mobile trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="docs-navigation-drawer"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-fg-muted lg:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Browse docs
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
            aria-hidden
          />
          <div
            ref={drawerRef}
            id="docs-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="docs-navigation-title"
            tabIndex={-1}
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-bg p-5"
          >
            <div className="mb-6 flex items-center justify-between">
              <span id="docs-navigation-title" className="font-display font-semibold text-fg">
                Documentation
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-fg-muted"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavList onNavigate={close} />
          </div>
        </div>
      )}
    </>
  );
}
