export type SearchEntry = {
  title: string;
  href: string;
  group: string;
  /** Extra terms to match against, beyond the title. */
  keywords: string;
};

/**
 * A curated search index over the documentation. The site is fully static, so
 * rather than crawl page content at runtime we keep a small hand-tuned index —
 * title, section, and the terms a reader is likely to type.
 */
const CURATED_SEARCH_INDEX: SearchEntry[] = [
  {
    title: "Introduction",
    href: "/docs/introduction",
    group: "Getting started",
    keywords:
      "what is jdesk why tauri electron compare mental model java webview overview",
  },
  {
    title: "Installation",
    href: "/docs/installation",
    group: "Getting started",
    keywords:
      "install setup prerequisites jdk 25 node webview create-jdesk-app scaffold template run",
  },
  {
    title: "Your first app",
    href: "/docs/your-first-app",
    group: "Getting started",
    keywords:
      "tutorial hello greeting command round trip getting started example beginner",
  },
  {
    title: "Project structure",
    href: "/docs/project-structure",
    group: "Getting started",
    keywords:
      "files layout basic structured module gradle build ui main capabilities json",
  },
  {
    title: "Defining commands",
    href: "/docs/defining-commands",
    group: "Guides",
    keywords:
      "command DesktopCommand annotation registry invoke request response record virtual thread codegen",
  },
  {
    title: "Emitting events",
    href: "/docs/emitting-events",
    group: "Guides",
    keywords:
      "event emit EventEmitter subscribe on push progress backpressure queue coalesce",
  },
  {
    title: "Streaming binary data",
    href: "/docs/streaming-binary-data",
    group: "Guides",
    keywords:
      "binary stream BinaryStream invokeStream file export blob backpressure pull readable large media",
  },
  {
    title: "Capabilities & permissions",
    href: "/docs/capabilities",
    group: "Guides",
    keywords:
      "capability permission grant deny by default RequiresCapability window json security",
  },
  {
    title: "Serving assets",
    href: "/docs/serving-assets",
    group: "Guides",
    keywords:
      "assets jdesk app scheme protocol csp content security policy range 206 mime asset route upload",
  },
  {
    title: "The dev loop & HMR",
    href: "/docs/the-dev-loop",
    group: "Guides",
    keywords:
      "dev loop hmr hot reload jdeskDev vite frontend java reload watch doctor development",
  },
  {
    title: "Packaging your app",
    href: "/docs/packaging",
    group: "Guides",
    keywords:
      "package jpackage jlink runtime image installer dmg pkg msi exe deb rpm sbom checksum distribute",
  },
  {
    title: "The CLI",
    href: "/docs/cli",
    group: "Guides",
    keywords:
      "cli create-jdesk-app jdesk command line npx options template package build bundle exit codes",
  },
  {
    title: "Architecture overview",
    href: "/docs/architecture",
    group: "Concepts",
    keywords:
      "architecture modules runtime platform adapter provider flow ffm codegen design",
  },
  {
    title: "How IPC works",
    href: "/docs/how-ipc-works",
    group: "Concepts",
    keywords:
      "ipc bridge envelope nonce invoke result async typed handshake lifecycle protocol",
  },
  {
    title: "Security model",
    href: "/docs/security-model",
    group: "Concepts",
    keywords:
      "security trust boundary capability origin navigation csp path traversal redaction popup",
  },
  {
    title: "Java API",
    href: "/docs/java-api",
    group: "Reference",
    keywords:
      "api reference JDeskApplication WindowConfig CommandRegistry InvocationContext EventEmitter UiDispatcher errors",
  },
];

export const SEARCH_INDEX: SearchEntry[] = [
  ...CURATED_SEARCH_INDEX,
  ...STANDALONE_DOCS.map((doc) => ({
    title: doc.title,
    href: `/docs/${doc.slug}`,
    group: doc.group,
    keywords: doc.keywords,
  })),
];
import { STANDALONE_DOCS } from "./standalone-docs";
