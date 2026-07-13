"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LogoMark } from "../logo";
import { clearToken, type AdminUser } from "../../lib/admin-auth";

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser | null;
  children: ReactNode;
}) {
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-display font-semibold text-fg">JDesk Admin</span>
          </Link>
          <Link
            href="/"
            className="ml-2 hidden text-sm text-fg-muted hover:text-fg sm:inline"
          >
            View site ↗
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-fg-muted sm:inline">
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <div className="flex items-center gap-3 text-sm text-fg-muted">
        <span className="h-4 w-4 animate-pulse rounded-full bg-gradient-to-r from-ember to-arc" />
        Loading…
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-6 flex gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            active === t.id ? "text-fg" : "text-fg-muted hover:text-fg"
          }`}
        >
          {t.label}
          {t.badge != null && t.badge > 0 && (
            <span className="rounded-full bg-ember-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-ember">
              {t.badge}
            </span>
          )}
          {active === t.id && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-ember to-arc" />
          )}
        </button>
      ))}
    </div>
  );
}
