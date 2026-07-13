import Link from "next/link";
import { GhostButton, PrimaryButton } from "./components/ui";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 signal-field opacity-60" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
        <div className="font-mono text-sm font-medium uppercase tracking-[0.2em] text-arc-strong">
          Error 404
        </div>
        <p className="mt-6 font-display text-6xl font-semibold tracking-tight">
          <span className="bridge-text">No result</span>
        </p>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-muted">
          That request crossed the bridge and found nothing on the other side.
          The page may have moved, or the link is out of date.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton href="/">Back to home</PrimaryButton>
          <GhostButton href="/docs">Browse the docs</GhostButton>
        </div>
        <p className="mt-10 font-mono text-xs text-fg-faint">
          <Link href="/docs/introduction" className="hover:text-fg">
            Introduction
          </Link>
          <span className="px-2">·</span>
          <Link href="/docs/installation" className="hover:text-fg">
            Installation
          </Link>
          <span className="px-2">·</span>
          <Link href="/docs/your-first-app" className="hover:text-fg">
            Your first app
          </Link>
        </p>
      </div>
    </div>
  );
}
