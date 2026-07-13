"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../../lib/admin-auth";
import { LogoMark } from "../../components/logo";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 signal-field opacity-50" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark size={30} />
          <span className="font-display text-xl font-semibold text-fg">
            JDesk Admin
          </span>
        </Link>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-line-strong bg-surface p-6 shadow-xl"
        >
          <h1 className="font-display text-lg font-semibold text-fg">Sign in</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Admin access to the CMS and feedback.
          </p>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-fg-faint">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jdesk.dev"
              className="no-focus-ring w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-arc/50"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-fg-faint">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="no-focus-ring w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-arc/50"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-lg border border-ember/40 bg-ember-soft px-3 py-2 text-sm text-ember">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-fg px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
