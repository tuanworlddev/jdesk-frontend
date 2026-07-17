import { createServer } from "node:http";

const slugs = [
  "architecture",
  "how-ipc-works",
  "security-model",
  "threading-event-loop",
  "native-memory-ffm",
  "introduction",
  "installation",
  "your-first-app",
  "project-structure",
  "defining-commands",
  "emitting-events",
  "streaming-binary-data",
  "capabilities",
  "serving-assets",
  "the-dev-loop",
  "packaging",
  "cli",
  "networked-real-time",
  "storing-secrets",
  "dialogs-printing",
  "automation-e2e",
  "updating-applications",
  "enterprise-policy",
  "diagnostics-support",
  "managing-windows",
  "choosing-frontend",
  "typescript-bindings",
  "signing-distributing",
  "plugins",
  "non-modular-libraries",
  "webview-sessions",
  "java-api",
  "gradle-plugin",
  "protocol",
  "capabilities-json",
  "error-codes",
  "typescript-client",
];

function title(slug) {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function group(index) {
  if (index < 5) return "Concepts";
  if (index < 9) return "Getting started";
  if (index < 31) return "Guides";
  return "Reference";
}

const documents = slugs.map((slug, index) => ({
  id: `fixture-${slug}`,
  slug,
  title: title(slug),
  description: `Test documentation for ${title(slug)}.`,
  eyebrow: group(index),
  group: group(index),
  order: index,
  published: true,
  content: `## ${title(slug)}\n\nThis fixture verifies the server-rendered documentation route.`,
}));

function json(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(value));
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:3001");

  if (url.pathname === "/api/site-content") {
    json(response, 200, {});
    return;
  }
  if (url.pathname === "/api/documents") {
    json(response, 200, documents);
    return;
  }
  if (url.pathname.startsWith("/api/documents/")) {
    const slug = decodeURIComponent(url.pathname.slice("/api/documents/".length));
    const document = documents.find((candidate) => candidate.slug === slug);
    json(response, document ? 200 : 404, document ?? { message: "Document not found" });
    return;
  }

  json(response, 404, { message: "Not found" });
});

server.listen(3001, "127.0.0.1");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
