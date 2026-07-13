import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Serving assets",
  description:
    "In production JDesk serves your web frontend over the jdesk://app/ scheme — no HTTP server.",
};

const HREF = "/docs/serving-assets";
const TOC = [
  { id: "how", label: "How assets load" },
  { id: "layout", label: "Where assets come from" },
  { id: "rules", label: "Path rules" },
  { id: "csp", label: "The default CSP" },
  { id: "range", label: "Range requests and media" },
  { id: "routes", label: "App-defined asset routes" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="Serving assets"
      description="In production, JDesk serves your web frontend over the custom jdesk://app/ scheme — there is no HTTP server. How assets load, how to lay them out, and the rules they must follow."
      href={HREF}
      toc={TOC}
    >
      <p>
        A window&rsquo;s entry points at <code>jdesk://app/</code>. There is no
        localhost server in production; each platform adapter intercepts{" "}
        <code>jdesk://app/</code> requests and hands them to the runtime, which
        resolves from an asset source. The root path resolves to{" "}
        <code>index.html</code>.
      </p>

      <H2 id="how">How assets load</H2>
      <p>Two asset sources:</p>
      <ul>
        <li>
          <code>ClasspathAssetSource</code> (production) — serves from a fixed
          prefix, typically <code>web/</code>, or a JPMS-aware lookup for a named
          module.
        </li>
        <li>
          <code>DirectoryAssetSource</code> (dev) — selected via{" "}
          <code>-Djdesk.assets.dir=&lt;path&gt;</code>; enforces containment on
          the symlink-resolved real path.
        </li>
      </ul>
      <p>
        Lay out your files under <code>src/main/resources/web/</code>.
      </p>

      <H2 id="layout">Where assets come from</H2>
      <p>
        Content-Type is derived from the file extension (<code>.html</code>,{" "}
        <code>.js</code>/<code>.mjs</code>, <code>.css</code>, <code>.json</code>,{" "}
        <code>.svg</code>, <code>.png</code>, <code>.woff2</code>,{" "}
        <code>.wasm</code>, and more; unrecognized becomes{" "}
        <code>application/octet-stream</code>). Cache-Control:{" "}
        <code>.html</code>/<code>.htm</code> are <code>no-cache</code>;
        content-hashed names get <code>public, max-age=31536000, immutable</code>;
        everything else is <code>no-cache</code>.
      </p>

      <H2 id="rules">Path rules</H2>
      <p>
        Paths are normalized strictly and rejected — never repaired; a violation
        gets a deterministic 404 with no echo of the path. Rejected:
      </p>
      <ul>
        <li>
          <code>..</code> and encoded traversal;
        </li>
        <li>NUL, backslash, and control chars;</li>
        <li>absolute or drive-letter forms;</li>
        <li>a colon in a segment;</li>
        <li>invalid percent-encoding or UTF-8;</li>
        <li>empty or trailing-dot/space segments;</li>
        <li>paths over 2048 chars or 64 segments.</li>
      </ul>
      <p>
        An optional SPA fallback serves <code>index.html</code> for extension-less
        misses; a request naming a file (one that contains a &quot;.&quot;) never
        falls back.
      </p>

      <H2 id="csp">The default CSP</H2>
      <p>
        A strict <code>Content-Security-Policy</code> is set on every response.
      </p>
      <CodeBlock
        lang="text"
        filename="default CSP"
        code={`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`}
      />
      <p>
        <code>{`script-src 'self'`}</code> blocks inline scripts and eval, so
        externalize all JS and CSS. Replace it with{" "}
        <code>.contentSecurityPolicy(String)</code>, or widen one directive from
        the strict defaults with the <code>Csp</code> builder (
        <code>Csp.defaults().connectSrc(...)</code>). Release builds refuse to
        start with <code>&apos;unsafe-inline&apos;</code>/
        <code>&apos;unsafe-eval&apos;</code>/<code>&apos;unsafe-hashes&apos;</code>{" "}
        unless <code>-Djdesk.security.acknowledgeUnsafeCsp=true</code>.
      </p>

      <H2 id="range">Range requests and media</H2>
      <p>
        The pipeline understands a single-range <code>Range: bytes=...</code>{" "}
        header, answers with 206 Partial Content plus <code>Content-Range</code>{" "}
        and a positioned stream, and advertises <code>Accept-Ranges: bytes</code>{" "}
        on success responses. An unsatisfiable range returns 416 with{" "}
        <code>Content-Range: bytes */&lt;size&gt;</code>. Multi-range or malformed
        headers fall back to a full 200. This is what makes large media work in{" "}
        <code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code>.
      </p>

      <H2 id="routes">App-defined asset routes</H2>
      <p>
        Register a route with <code>.assetRoute(&quot;prefix&quot;, handler)</code>{" "}
        to serve Java-produced binary content directly — avoiding base64 data-URI
        inflation and the 1 MiB envelope cap. The handler returns{" "}
        <code>Optional&lt;AssetRoute.Response&gt;</code> (
        <code>Optional.empty()</code> is a 404).
      </p>
      <CodeBlock
        lang="java"
        filename="Main.java"
        code={`JDeskApplication.builder()
    .assetRoute("proxy/images", request -> {
        Path cached = imageCache.fetch(request.path());
        return Optional.of(AssetRoute.Response.of(cached, "image/jpeg"));
    })`}
      />
      <p>
        The same route receives POST uploads as exact bytes via{" "}
        <code>request.body()</code>, capped by{" "}
        <code>jdesk.assets.maxUploadBytes</code> (default 64 MiB; over-cap returns
        413 before the handler runs).
      </p>
      <Callout variant="warning">
        On Windows (WebView2) and Linux (WebKitGTK) the adapters do not forward
        request bodies yet, so <code>request.body()</code> is empty there — use a
        command with chunked transfer instead. Live-verified end-to-end on macOS
        (WKWebView). See{" "}
        <a href="/docs/streaming-binary-data">Streaming binary data</a>.
      </Callout>
    </DocArticle>
  );
}
