import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLink } from "../components/ui";
import { DOCS_NAV } from "./nav";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn JDesk from scratch: a Java 25 core, a web frontend, and the operating system's own WebView.",
};

const CARDS = [
  {
    tone: "arc" as const,
    kicker: "Start here",
    title: "Getting started",
    body: "Understand the model, install the toolchain, and build a working app that calls Java from the web UI.",
  },
  {
    tone: "ember" as const,
    kicker: "Build",
    title: "Guides",
    body: "Task-oriented how-tos for defining commands, emitting events, granting capabilities, and driving the CLI.",
  },
  {
    tone: "arc" as const,
    kicker: "Understand",
    title: "Concepts",
    body: "How the pieces fit: the architecture, the asynchronous typed IPC, and the Java-enforced security model.",
  },
  {
    tone: "ember" as const,
    kicker: "Look up",
    title: "Reference",
    body: "Exact, complete descriptions of the public Java API surface and the command / event vocabulary.",
  },
];

export default function DocsHome() {
  return (
    <div className="py-8 lg:py-10">
      {/* gradient hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-line p-8 sm:p-12">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 140% at 12% 0%, color-mix(in srgb, var(--ember) 26%, transparent), transparent 55%), radial-gradient(120% 140% at 92% 100%, color-mix(in srgb, var(--arc) 30%, transparent), transparent 55%), var(--surface)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 signal-field opacity-40" />
        <div className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-fg-muted">
          JDesk documentation
        </div>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-fg sm:text-5xl">
          Everything you need to build with JDesk.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
          A framework for desktop apps with a Java&nbsp;25 core and a web
          frontend, rendered by the operating system&rsquo;s own WebView. New
          here? Read Getting started top to bottom. Already know the basics? Jump
          to a guide, a concept, or the reference.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs/introduction"
            className="inline-flex items-center gap-2 rounded-xl bg-fg px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Read the introduction
          </Link>
          <Link
            href="/docs/installation"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface/60 px-5 py-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            Install JDesk
          </Link>
        </div>
      </div>

      {/* section cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => {
          const links = DOCS_NAV.find((group) => group.title === card.title)?.items ?? [];
          return (
          <div key={card.title} className="card flex flex-col p-6">
            <div
              className={`font-mono text-xs font-medium uppercase tracking-[0.16em] ${
                card.tone === "ember" ? "text-ember" : "text-arc-strong"
              }`}
            >
              {card.kicker}
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold text-fg">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {card.body}
            </p>
            <ul className="mt-4 space-y-1.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    <span className="text-fg-faint">→</span>
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-xl border border-line bg-surface px-6 py-5">
        <div>
          <div className="font-display font-semibold text-fg">
            Prefer to read the source?
          </div>
          <p className="mt-1 text-sm text-fg-muted">
            JDesk is Apache-2.0 and developed in the open.
          </p>
        </div>
        <ArrowLink href="https://github.com/tuanworlddev/jdesk" external>
          GitHub
        </ArrowLink>
      </div>
    </div>
  );
}
