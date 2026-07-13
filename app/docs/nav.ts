export type DocLink = { title: string; href: string };
export type DocGroup = { title: string; items: DocLink[] };

export const DOCS_NAV: DocGroup[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/docs/introduction" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Project structure", href: "/docs/project-structure" },
      { title: "Your first app", href: "/docs/your-first-app" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Defining commands", href: "/docs/defining-commands" },
      { title: "Emitting events", href: "/docs/emitting-events" },
      { title: "Streaming binary data", href: "/docs/streaming-binary-data" },
      { title: "Networked & real-time apps", href: "/docs/networked-real-time" },
      { title: "Store secrets", href: "/docs/storing-secrets" },
      { title: "Dialogs & printing", href: "/docs/dialogs-printing" },
      { title: "Automation & E2E", href: "/docs/automation-e2e" },
      { title: "Updating applications", href: "/docs/updating-applications" },
      { title: "Enterprise managed policy", href: "/docs/enterprise-policy" },
      { title: "Diagnostics & support", href: "/docs/diagnostics-support" },
      { title: "Capabilities & permissions", href: "/docs/capabilities" },
      { title: "Managing windows", href: "/docs/managing-windows" },
      { title: "Serving assets", href: "/docs/serving-assets" },
      { title: "Choosing a frontend", href: "/docs/choosing-frontend" },
      { title: "The dev loop & HMR", href: "/docs/the-dev-loop" },
      { title: "TypeScript bindings", href: "/docs/typescript-bindings" },
      { title: "Packaging your app", href: "/docs/packaging" },
      { title: "Signing & distributing", href: "/docs/signing-distributing" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { title: "Architecture overview", href: "/docs/architecture" },
      { title: "How IPC works", href: "/docs/how-ipc-works" },
      { title: "Threading & event loop", href: "/docs/threading-event-loop" },
      { title: "Native memory & FFM", href: "/docs/native-memory-ffm" },
      { title: "Security model", href: "/docs/security-model" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "Java API", href: "/docs/java-api" },
      { title: "The CLI", href: "/docs/cli" },
      { title: "Gradle plugin", href: "/docs/gradle-plugin" },
      { title: "IPC protocol", href: "/docs/protocol" },
      { title: "Capabilities JSON", href: "/docs/capabilities-json" },
      { title: "Error codes", href: "/docs/error-codes" },
      { title: "TypeScript client", href: "/docs/typescript-client" },
    ],
  },
];

// Flattened order, used for prev/next navigation at the foot of each page.
export const DOCS_FLAT: DocLink[] = DOCS_NAV.flatMap((g) => g.items);

export function siblings(href: string): {
  prev: DocLink | null;
  next: DocLink | null;
} {
  const i = DOCS_FLAT.findIndex((l) => l.href === href);
  return {
    prev: i > 0 ? DOCS_FLAT[i - 1] : null,
    next: i >= 0 && i < DOCS_FLAT.length - 1 ? DOCS_FLAT[i + 1] : null,
  };
}
