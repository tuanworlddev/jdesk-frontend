import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("out");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : target;
    }),
  );
  return files.flat();
}

function routeFor(file) {
  const relative = path.relative(OUT_DIR, file).split(path.sep).join("/");
  if (relative === "404.html" || relative === "_not-found.html") return "/*";
  if (relative === "index.html") return "/";
  return `/${relative.replace(/\.html$/, "").replace(/\/index$/, "")}`;
}

function hashesFor(html) {
  const hashes = new Set();
  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (!match[1]) continue;
    const digest = createHash("sha256").update(match[1]).digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }
  return [...hashes].sort();
}

function csp(hashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const common = [
  "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin",
  "  X-Frame-Options: DENY",
  "  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
  "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "  Cross-Origin-Opener-Policy: same-origin",
];

const htmlFiles = (await walk(OUT_DIR)).filter((file) => file.endsWith(".html"));
const policies = new Map();
for (const file of htmlFiles) {
  const route = routeFor(file);
  const hashes = hashesFor(await readFile(file, "utf8"));
  policies.set(route, csp(hashes));
}

const fallback = policies.get("/*");
if (!fallback) throw new Error("The static export did not produce a 404 page.");

const lines = ["/*", ...common, `  Content-Security-Policy: ${fallback}`, ""];
for (const [route, policy] of [...policies].sort(([a], [b]) => a.localeCompare(b))) {
  if (route === "/*") continue;
  lines.push(route, `  Content-Security-Policy: ${policy}`, "");
}

await writeFile(path.join(OUT_DIR, "_headers"), `${lines.join("\n")}\n`);

const nginxLines = ["map $uri $jdesk_csp {", `    default "${fallback}";`];
for (const [route, policy] of [...policies].sort(([a], [b]) => a.localeCompare(b))) {
  if (route === "/*") continue;
  nginxLines.push(`    ${route} "${policy}";`);
  nginxLines.push(`    ${route === "/" ? "/index.html" : `${route}.html`} "${policy}";`);
}
nginxLines.push("}", "");
await writeFile(
  path.join(OUT_DIR, "csp-map.conf"),
  `${nginxLines.join("\n")}\n`,
);

console.log(`Generated CSP policies for ${policies.size} static HTML routes.`);
