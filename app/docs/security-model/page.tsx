import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Security model",
  description:
    "The trust model behind JDesk and why it is enforced in Java: capabilities, origin locking, CSP, and error redaction.",
};

const HREF = "/docs/security-model";
const TOC = [
  { id: "boundary", label: "The trust boundary is Java" },
  { id: "deny", label: "Deny by default" },
  { id: "origin", label: "Origin and navigation locking" },
  { id: "csp", label: "The strict CSP" },
  { id: "assets", label: "Asset path-traversal defenses" },
  { id: "redaction", label: "Error redaction" },
  { id: "scope", label: "What the model does not claim" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Concepts"
      title="Security model"
      description="Why JDesk enforces its trust boundary in Java: deny-by-default capabilities evaluated before your code runs, navigation and origin locking, a strict CSP, asset path-traversal defenses, and error redaction."
      href={HREF}
      toc={TOC}
    >
      <p>
        This is the understanding-oriented companion to the threat model.
      </p>

      <H2 id="boundary">The trust boundary is Java</H2>
      <p>JDesk recognizes three trust levels:</p>
      <ul>
        <li>
          The Java core is trusted &mdash; full JVM authority; native access
          only to the platform modules.
        </li>
        <li>
          The frontend document at the app origin is semi-trusted &mdash;
          treated as compromisable by XSS or a supply-chain issue.
        </li>
        <li>Any other origin is untrusted.</li>
      </ul>
      <p>
        The single boundary is the Java-side check on every invoke; the
        frontend is never trusted to enforce anything.
      </p>

      <H2 id="deny">Deny by default</H2>
      <p>
        Every command must be classified at compile time &mdash;{" "}
        <code>@RequiresCapability(&quot;name&quot;)</code> or{" "}
        <code>@PublicDesktopCommand</code>; a command with neither is a
        compile-time error. The capability engine evaluates before payload
        deserialization and before the handler. Denials are uniform:{" "}
        <code>CAPABILITY_DENIED</code> with &quot;Command is not allowed for
        this window.&quot; Grants are per window in{" "}
        <code>jdesk-capabilities.json</code>. Because XSS is a capability-scoped
        compromise, keep the granted set small. See{" "}
        <a href="/docs/capabilities">Capabilities &amp; permissions</a>.
      </p>

      <H2 id="origin">Origin and navigation locking</H2>
      <p>
        An origin check runs on every invoke: the committed top-level origin is
        normalized (lowercased scheme/host, default ports elided, paths and
        userinfo rejected) and required to be an allowed origin &mdash;{" "}
        <code>jdesk://app</code> in production, plus one configured{" "}
        <code>http://127.0.0.1:&lt;port&gt;</code> dev origin, with no silent
        fallback. Production main-frame navigation is restricted to allowed
        origins; subframe loads are allowed but get no native authority.
        New-window and popup requests are denied at the adapter level; external
        links require an explicit, non-default capability.
      </p>

      <H2 id="csp">The strict CSP</H2>
      <p>
        A strict Content-Security-Policy is applied to every response.
      </p>
      <CodeBlock
        lang="text"
        filename="default CSP"
        code={`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`}
      />
      <p>
        <code>script-src &apos;self&apos;</code> blocks inline scripts and eval,
        so externalize all JS and CSS. Release builds reject a CSP weakened with{" "}
        <code>&apos;unsafe-inline&apos;</code>,{" "}
        <code>&apos;unsafe-eval&apos;</code>, or{" "}
        <code>&apos;unsafe-hashes&apos;</code> unless the developer sets an
        explicit, named acknowledgement that appears in the build report.
      </p>

      <H2 id="assets">Asset path-traversal defenses</H2>
      <p>
        Assets are served over <code>jdesk://app/</code> via resource
        interception (no localhost server). Normalization rejects rather than
        repairs: <code>..</code> and encoded traversal, NUL and control chars,
        backslashes, colons, absolute or drive-letter forms, invalid
        percent-encoding, and empty segments. Directory sources enforce symlink
        containment. A rejected request gets a deterministic 404 with no echo of
        the input path.
      </p>

      <H2 id="redaction">Error redaction</H2>
      <p>
        Handler exceptions become <code>INTERNAL_ERROR</code> &quot;Command
        failed&quot; &mdash; never class names, stack traces, paths, SQL, or
        secrets. Every frontend error is a public <code>ErrorCode</code> name
        with a generic message; the detail stays in the Java-side logs.
      </p>

      <H2 id="scope">What the model does not claim</H2>
      <p>What the model does not claim:</p>
      <ul>
        <li>Same-origin content inherits its window&rsquo;s full authority.</li>
        <li>The bridge primitive is intentionally visible.</li>
        <li>
          Subframe origin is not distinguished at the IPC layer in v1.
        </li>
      </ul>
      <p>
        Out of scope: a compromised host OS or JVM, physical access, and
        malicious WebView binaries.
      </p>
    </DocArticle>
  );
}
