import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLink } from "../components/ui";
import { fetchDocsNav } from "../lib/docs";
import { fetchSiteContent } from "../lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn JDesk from scratch: a Java 25 core, a web frontend, and the operating system's own WebView.",
  alternates: { canonical: "/docs" },
};

// Curated kicker + blurb per group; links come from the database.
const GROUP_META: Record<
  string,
  { kicker: string; tone: "arc" | "ember"; body: string }
> = {
  "Getting started": {
    kicker: "Start here",
    tone: "arc",
    body: "Understand the model, install the toolchain, and build a working app that calls Java from the web UI.",
  },
  Guides: {
    kicker: "Build",
    tone: "ember",
    body: "Task-oriented how-tos for commands, events, capabilities, packaging, and everything you do while building.",
  },
  Concepts: {
    kicker: "Understand",
    tone: "arc",
    body: "How the pieces fit: the architecture, the asynchronous typed IPC, and the Java-enforced security model.",
  },
  Reference: {
    kicker: "Look up",
    tone: "ember",
    body: "Exact, complete descriptions of the public API surface and the command / event vocabulary.",
  },
};

export default async function DocsHome() {
  const [{ groups }, { general }] = await Promise.all([
    fetchDocsNav(),
    fetchSiteContent(),
  ]);

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
          {general.siteName} documentation
        </div>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-fg sm:text-5xl">
          Everything you need to build with {general.siteName}.
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
            Install {general.siteName}
          </Link>
        </div>
      </div>

      {/* section cards — one per group, from the database */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const meta =
            GROUP_META[group.title] ??
            ({ kicker: "Docs", tone: "arc", body: "" } as const);
          return (
            <div key={group.title} className="card flex flex-col p-6">
              <div
                className={`font-mono text-xs font-medium uppercase tracking-[0.16em] ${
                  meta.tone === "ember" ? "text-ember" : "text-arc-strong"
                }`}
              >
                {meta.kicker}
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-fg">
                {group.title}
              </h2>
              {meta.body && (
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {meta.body}
                </p>
              )}
              <ul className="mt-4 space-y-1.5">
                {group.items.slice(0, 5).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      <span className="text-fg-faint">→</span>
                      {item.title}
                    </Link>
                  </li>
                ))}
                {group.items.length > 5 && (
                  <li className="pl-4 text-xs text-fg-faint">
                    +{group.items.length - 5} more
                  </li>
                )}
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
            {general.siteName} is Apache-2.0 and developed in the open.
          </p>
        </div>
        <ArrowLink href={general.githubUrl} external>
          GitHub
        </ArrowLink>
      </div>
    </div>
  );
}
