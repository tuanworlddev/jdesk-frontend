import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { createGzip } from "node:zlib";

const root = path.resolve("out");
const port = Number(process.env.PORT ?? process.argv[2] ?? 3000);

function parseHeaders() {
  const file = path.join(root, "_headers");
  if (!existsSync(file)) return [];
  const rules = [];
  let current;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    if (!line.startsWith(" ")) {
      current = { path: line.trim(), headers: {} };
      rules.push(current);
      continue;
    }
    const separator = line.indexOf(":");
    if (!current || separator < 0) continue;
    current.headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return rules;
}

const rules = parseHeaders();
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const candidates = [
    path.join(root, safePath),
    path.join(root, `${safePath}.html`),
    path.join(root, safePath, "index.html"),
  ];
  let file = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  let status = 200;
  if (!file) {
    file = path.join(root, "404.html");
    status = 404;
  }

  for (const rule of rules) {
    if (rule.path === "/*" || rule.path === pathname) {
      for (const [key, value] of Object.entries(rule.headers)) response.setHeader(key, value);
    }
  }
  response.statusCode = status;
  const contentType = mime[path.extname(file)] ?? "application/octet-stream";
  response.setHeader("Content-Type", contentType);
  const compress =
    /gzip/.test(request.headers["accept-encoding"] ?? "") &&
    /^(?:text\/|application\/(?:javascript|json|xml))/.test(contentType);
  if (compress) {
    response.setHeader("Content-Encoding", "gzip");
    response.setHeader("Vary", "Accept-Encoding");
    createReadStream(file).pipe(createGzip()).pipe(response);
  } else {
    createReadStream(file).pipe(response);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static JDesk preview: http://127.0.0.1:${port}`);
});
