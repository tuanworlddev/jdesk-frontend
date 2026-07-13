import Link from "next/link";
import { LogoMark } from "./logo";

const COLUMNS = [
  {
    title: "Get started",
    links: [
      { label: "Introduction", href: "/docs/introduction" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Your first app", href: "/docs/your-first-app" },
      { label: "Project structure", href: "/docs/project-structure" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Defining commands", href: "/docs/defining-commands" },
      { label: "Streaming binary data", href: "/docs/streaming-binary-data" },
      { label: "Serving assets", href: "/docs/serving-assets" },
      { label: "Packaging your app", href: "/docs/packaging" },
    ],
  },
  {
    title: "Concepts",
    links: [
      { label: "Architecture", href: "/docs/architecture" },
      { label: "How IPC works", href: "/docs/how-ipc-works" },
      { label: "Security model", href: "/docs/security-model" },
      { label: "Java API", href: "/docs/java-api" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg-tint">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-lg font-semibold text-fg">
                JDesk
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
              Desktop apps with a Java 25 core and a web UI, rendered by the
              operating system&rsquo;s own WebView. The Tauri model, without
              Rust.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-faint">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-faint">
            Apache-2.0 licensed. JDesk is open source and under active
            development.
          </p>
          <div className="flex items-center gap-5 text-xs text-fg-muted">
            <a
              href="https://github.com/tuanworlddev/jdesk"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-fg"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/create-jdesk-app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-fg"
            >
              npm
            </a>
            <Link href="/docs" className="transition-colors hover:text-fg">
              Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
