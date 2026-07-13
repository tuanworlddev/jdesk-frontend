export type DocLink = { title: string; href: string };
export type DocGroup = { title: string; items: DocLink[] };

export const DOCS_NAV: DocGroup[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/docs/introduction" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Your first app", href: "/docs/your-first-app" },
      { title: "Project structure", href: "/docs/project-structure" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Defining commands", href: "/docs/defining-commands" },
      { title: "Emitting events", href: "/docs/emitting-events" },
      { title: "Streaming binary data", href: "/docs/streaming-binary-data" },
      { title: "Capabilities & permissions", href: "/docs/capabilities" },
      { title: "Serving assets", href: "/docs/serving-assets" },
      { title: "The dev loop & HMR", href: "/docs/the-dev-loop" },
      { title: "Packaging your app", href: "/docs/packaging" },
      { title: "The CLI", href: "/docs/cli" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { title: "Architecture overview", href: "/docs/architecture" },
      { title: "How IPC works", href: "/docs/how-ipc-works" },
      { title: "Security model", href: "/docs/security-model" },
    ],
  },
  {
    title: "Reference",
    items: [{ title: "Java API", href: "/docs/java-api" }],
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
