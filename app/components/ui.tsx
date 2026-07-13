import Link from "next/link";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/70 px-3 py-1 font-mono text-xs text-fg-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-arc" />
      {children}
    </span>
  );
}

export function ArrowLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls =
    "group inline-flex items-center gap-1.5 text-sm font-medium text-fg transition-colors hover:text-arc-strong";
  const inner = (
    <>
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5"
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-fg px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-5 py-3 text-sm font-semibold text-fg transition-colors hover:border-fg-faint hover:bg-surface-2";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function SectionEyebrow({
  children,
  tone = "arc",
}: {
  children: ReactNode;
  tone?: "arc" | "ember";
}) {
  return (
    <div
      className={`mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] ${
        tone === "arc" ? "text-arc-strong" : "text-ember"
      }`}
    >
      {children}
    </div>
  );
}
