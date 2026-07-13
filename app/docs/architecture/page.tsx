import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "../../components/code-block";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Architecture overview",
  description:
    "How the pieces of a JDesk app fit together: modules, the request/response flow, and provider selection.",
};

const HREF = "/docs/architecture";
const TOC = [
  { id: "modules", label: "The module map" },
  { id: "flow", label: "Request / response flow" },
  { id: "provider", label: "Provider selection" },
  { id: "principles", label: "Architecture principles" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Concepts"
      title="Architecture overview"
      description="JDesk is built on Java 25 plus the operating-system WebView — the Tauri model without Rust. Application logic lives on the JVM; the UI is any static web build rendered by the platform's own WebView."
      href={HREF}
      toc={TOC}
    >
      <p>
        There is no bundled Chromium, no localhost HTTP server in production, and
        no Rust. Application and plugin logic run in the JVM (JPMS modules,
        virtual threads, FFM native access).
      </p>

      <H2 id="modules">The module map</H2>
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>dev.jdesk:jdesk-api</code>
            </td>
            <td>
              The public Java-only API surface (<code>JDeskApplication</code>,{" "}
              <code>WindowConfig</code>, <code>CommandRegistry</code>,{" "}
              <code>InvocationContext</code>, <code>EventEmitter</code>,{" "}
              <code>UiDispatcher</code>, annotations, public errors). No
              AWT/Swing/JavaFX or native types.
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-runtime</code>
            </td>
            <td>
              The pure-Java engine: lifecycle state machine, IPC protocol v1,
              capability engine (evaluated before deserialization), asset
              resolver, command dispatch onto virtual threads, limits,
              cancellation, backpressure.
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-webview-spi</code>
            </td>
            <td>
              The platform SPI (<code>PlatformProvider</code>,{" "}
              <code>PlatformApplication</code>, <code>PlatformWindow</code>,{" "}
              <code>PlatformWebView</code>).
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-native-ffm</code>
            </td>
            <td>
              Shared Foreign Function &amp; Memory helpers (package{" "}
              <code>dev.jdesk.ffm</code>).
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-platform-windows</code>
            </td>
            <td>
              Win32 + WebView2 (COM, STA); provider id{" "}
              <code>windows-webview2</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-platform-macos</code>
            </td>
            <td>
              AppKit + WKWebView (Objective-C via FFM); provider id{" "}
              <code>macos-wkwebview</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-platform-linux</code>
            </td>
            <td>
              GTK 3 + WebKitGTK 4.1; provider id <code>linux-webkitgtk</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-codegen</code>
            </td>
            <td>
              The annotation processor: compile-time registration into{" "}
              <code>&lt;Service&gt;Commands</code> registries plus{" "}
              <code>types.ts</code> / <code>commands.ts</code>. Deterministic
              output.
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-cli</code>
            </td>
            <td>The standalone project generator.</td>
          </tr>
          <tr>
            <td>
              <code>jdesk-gradle-plugin</code>
            </td>
            <td>
              The <code>dev.jdesk.application</code> plugin (doctor, bindings,
              frontend build, dev loop, runtime image, package).
            </td>
          </tr>
          <tr>
            <td>
              <code>jdesk-packager</code>
            </td>
            <td>
              jlink / jpackage / jdeps argument builders plus release artifacts
              (SHA-256 checksums, CycloneDX SBOM).
            </td>
          </tr>
        </tbody>
      </table>

      <H2 id="flow">Request / response flow</H2>
      <p>One command round trip.</p>
      <CodeBlock
        lang="text"
        filename="one round trip"
        code={`JS  commands.greeting.greet({name})     // typed wrapper, jdesk-client
      │  invoke envelope {v,kind:"invoke",id,command,payload,nonce}
      ▼
Native WebView message channel  ──►  PlatformWebView.onMessage (UI thread)
      ▼
Runtime bridge / dispatcher
      │  1. validate nonce   2. enforce limits   3. capability check
      │  4. deserialize payload into the command DTO
      ▼
Virtual-thread handler  → returns CompletionStage<Res>
      ▼
Result envelope {v,kind:"result",id,ok,value|error}`}
      />
      <ul>
        <li>
          The capability check runs before deserialization and before user code.
        </li>
        <li>
          Handlers run on virtual threads; the UI thread only copies and posts
          messages.
        </li>
        <li>
          Responses correlate by <code>id</code> — exactly one terminal result
          per request.
        </li>
        <li>Navigation invalidates the nonce and cancels in-flight calls.</li>
      </ul>
      <p>
        <Link href="/docs/how-ipc-works">How IPC works</Link>.
      </p>

      <H2 id="provider">Provider selection</H2>
      <p>
        The runtime never scans the classpath.{" "}
        <code>JDeskApplication.run()</code> loads a bootstrap via{" "}
        <code>ServiceLoader</code>, which loads exactly one{" "}
        <code>PlatformProvider</code>. Zero, or more than one, is a fatal startup
        error (&ldquo;Expected exactly one provider, found N&rdquo;). For dev you
        can override selection:
      </p>
      <CodeBlock terminal code={`./gradlew run -PjdeskPlatform=macos`} />

      <H2 id="principles">Architecture principles</H2>
      <ul>
        <li>
          <strong>System WebView</strong> — no bundled Chromium.
        </li>
        <li>
          <strong>No localhost</strong> — no HTTP listener in production; assets
          are served over <code>jdesk://app/</code>, with one optional{" "}
          <code>http://127.0.0.1:&lt;port&gt;</code> dev origin.
        </li>
        <li>
          <strong>No Rust</strong> — all native access goes through Java&rsquo;s
          Foreign Function &amp; Memory API.
        </li>
        <li>
          <strong>Deny by default</strong> — every command is capability-checked.
        </li>
        <li>
          <strong>Compile-time registration</strong> — commands are discovered by
          an annotation processor, not runtime reflection.
        </li>
        <li>
          <strong>JVM distribution first</strong> — small binaries via jlink +
          jpackage.
        </li>
      </ul>
    </DocArticle>
  );
}
