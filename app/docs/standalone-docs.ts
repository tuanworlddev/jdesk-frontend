export type StandaloneDoc = {
  slug: string;
  title: string;
  description: string;
  group: "Guides" | "Concepts" | "Reference";
  keywords: string;
};

/** Content for these pages lives in this repository under content/docs. */
export const STANDALONE_DOCS: StandaloneDoc[] = [
  { slug: "networked-real-time", title: "Networked & real-time apps", description: "Connect JDesk applications to WebSocket, SSE, and other real-time services without blocking the UI thread.", group: "Guides", keywords: "network websocket sse realtime game dashboard server push" },
  { slug: "storing-secrets", title: "Store secrets", description: "Store credentials with the operating system credential store instead of local files or browser storage.", group: "Guides", keywords: "secret credential keychain dpapi linux secret service password token" },
  { slug: "dialogs-printing", title: "Dialogs & printing", description: "Open native file dialogs, message dialogs, and print the current WebView document.", group: "Guides", keywords: "dialog file chooser save open message print native" },
  { slug: "automation-e2e", title: "Automation & E2E", description: "Drive a JDesk application through the opt-in automation module for end-to-end tests and CI.", group: "Guides", keywords: "automation e2e test ci agent snapshot token endpoint" },
  { slug: "updating-applications", title: "Updating applications", description: "Coordinate signed application updates with health checks and rollback.", group: "Guides", keywords: "update signed manifest rollback health release" },
  { slug: "enterprise-policy", title: "Enterprise managed policy", description: "Restrict runtime features through a centrally managed policy file.", group: "Guides", keywords: "enterprise managed policy devtools update automation support" },
  { slug: "diagnostics-support", title: "Diagnostics & support", description: "Create bounded, redacted support bundles for troubleshooting production applications.", group: "Guides", keywords: "diagnostics support bundle logs redact troubleshooting" },
  { slug: "managing-windows", title: "Managing windows", description: "Create, configure, show, hide, navigate, and close application windows safely.", group: "Guides", keywords: "window lifecycle navigate bounds maximize close show hide" },
  { slug: "choosing-frontend", title: "Choosing a frontend", description: "Choose between plain HTML, React, Vue, and Svelte for a JDesk user interface.", group: "Guides", keywords: "frontend react vue svelte vanilla vite template" },
  { slug: "typescript-bindings", title: "TypeScript bindings", description: "Generate a typed browser client from Java command records at compile time.", group: "Guides", keywords: "typescript bindings codegen generated command record types" },
  { slug: "signing-distributing", title: "Signing & distributing", description: "Sign, notarize, verify, and publish native JDesk application packages.", group: "Guides", keywords: "sign notarize distribute dmg msi rpm checksum sbom" },
  { slug: "threading-event-loop", title: "Threading & event loop", description: "Understand UI dispatch, virtual-thread command handlers, events, and backpressure.", group: "Concepts", keywords: "threading ui event loop virtual threads backpressure dispatcher" },
  { slug: "native-memory-ffm", title: "Native memory & FFM", description: "Understand how JDesk uses Java's Foreign Function & Memory API to call platform WebViews.", group: "Concepts", keywords: "native memory ffm arena linker callback upcall platform" },
  { slug: "gradle-plugin", title: "Gradle plugin", description: "Configure development, bindings, packaging, installers, and diagnostics through dev.jdesk.application.", group: "Reference", keywords: "gradle plugin tasks jdeskDev package installer doctor configuration" },
  { slug: "protocol", title: "IPC protocol", description: "The exact versioned JSON envelope and processing rules used across the JDesk bridge.", group: "Reference", keywords: "ipc protocol envelope nonce invoke result event stream json" },
  { slug: "capabilities-json", title: "Capabilities JSON", description: "Reference for the versioned, deny-by-default per-window capability policy.", group: "Reference", keywords: "capabilities json window grant permission schema limits" },
  { slug: "error-codes", title: "Error codes", description: "Stable public error codes returned by the runtime, bridge, asset server, and tooling.", group: "Reference", keywords: "error codes exception protocol timeout denied invalid request" },
  { slug: "typescript-client", title: "TypeScript client", description: "Reference for invoke, events, cancellation, reset, and binary streams in @jdesk/client.", group: "Reference", keywords: "typescript client invoke on event abort timeout stream reset" },
  { slug: "plugins", title: "Plugins", description: "Extend an app with signed, integrity-checked, capability-gated third-party plugins.", group: "Guides", keywords: "plugin manifest signed integrity capability deny-by-default ed25519 authorization" },
  { slug: "non-modular-libraries", title: "Using non-modular libraries", description: "Use automatic-module Java libraries (like LSP4J) in a JPMS app for both dev and packaging.", group: "Guides", keywords: "jpms automatic module non-modular lsp4j extra-java-module-info jlink jpackage sidecar" },
];

export const STANDALONE_DOC_BY_SLUG = new Map(
  STANDALONE_DOCS.map((doc) => [doc.slug, doc]),
);
