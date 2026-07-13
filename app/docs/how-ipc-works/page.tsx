import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "How IPC works",
  description:
    "The model behind JDesk's IPC: versioned JSON envelopes, the bridge, the nonce, and the invoke lifecycle.",
};

const HREF = "/docs/how-ipc-works";
const TOC = [
  { id: "channel", label: "The shape of the channel" },
  { id: "bridge", label: "The bridge" },
  { id: "async", label: "Why it is asynchronous" },
  { id: "typed", label: "Why it is compile-time typed" },
  { id: "nonce", label: "The per-navigation nonce" },
  { id: "lifecycle", label: "The invoke lifecycle" },
  { id: "events", label: "Events and backpressure" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Concepts"
      title="How IPC works"
      description="How the web frontend and the Java core talk: why every message is a versioned JSON envelope, why the channel is asynchronous, and why it is authorized entirely on the Java side."
      href={HREF}
      toc={TOC}
    >
      <p>
        This page is understanding-oriented; the exact wire format lives in the{" "}
        <Link href="/docs/protocol">protocol reference</Link>.
      </p>

      <H2 id="channel">The shape of the channel</H2>
      <p>
        Everything crossing the boundary is a string — a single JSON envelope
        with a version field (<code>v</code>, currently <code>1</code>). The
        frontend sends <code>invoke</code>; Java answers with exactly one{" "}
        <code>result</code>; Java pushes <code>event</code> envelopes. A{" "}
        <code>hello</code>/<code>helloAck</code> handshake and a per-navigation{" "}
        nonce control envelope frame the session. String-only passing means no
        shared heap, no cross-boundary proxy lifetime, and one auditable choke
        point.
      </p>
      <p>The message kinds are:</p>
      <ul>
        <li>
          <code>nonce</code> — the per-navigation control envelope.
        </li>
        <li>
          <code>hello</code> / <code>helloAck</code> — the session handshake.
        </li>
        <li>
          <code>invoke</code> — a frontend call to a Java command.
        </li>
        <li>
          <code>result</code> — the single correlated answer to an invoke.
        </li>
        <li>
          <code>event</code> — a Java-to-frontend push with no reply.
        </li>
        <li>
          <code>cancel</code> — a request to cancel an in-flight invoke.
        </li>
      </ul>

      <H2 id="bridge">The bridge</H2>
      <p>
        The channel is <code>window.__jdesk</code> (&ldquo;the bridge&rdquo;),
        injected as a document-start script over each platform&rsquo;s native
        channel (<code>webkit.messageHandlers.jdesk</code> on WKWebView and
        WebKitGTK, <code>chrome.webview</code> on WebView2). It exposes{" "}
        <code>window.__jdesk.post(string)</code> outbound and dispatches inbound
        as a <code>jdesk-message</code> <code>CustomEvent</code> on{" "}
        <code>document</code>. The bridge&rsquo;s visibility is intentional —
        security rests on Java-side checks, not on hiding <code>post</code>.
      </p>

      <H2 id="async">Why it is asynchronous</H2>
      <p>
        Every <code>invoke</code> returns a <code>Promise</code>, answered later
        by a correlated <code>result</code>. The native UI thread must stay
        responsive, so it only copies a message and hands off; handlers run on
        virtual threads. Many commands can be in flight at once, correlated by{" "}
        <code>id</code>, completing in any order.
      </p>

      <H2 id="typed">Why it is compile-time typed</H2>
      <p>
        <code>jdesk-codegen</code> reads <code>@DesktopCommand</code> methods and
        generates a Java registry plus a typed TypeScript client. No classpath
        scanning, no runtime reflection; a mismatched call fails to compile. The
        runtime cost is a registry lookup plus deserialization into a known
        record with a defensive codec (polymorphic deserialization and default
        typing stay disabled).
      </p>

      <H2 id="nonce">The per-navigation nonce</H2>
      <p>
        Each main-frame navigation mints a fresh 128-bit{" "}
        <code>SecureRandom</code> nonce, delivered to the top frame via a{" "}
        nonce control envelope. The client echoes it in every <code>hello</code>,{" "}
        <code>invoke</code>, and <code>cancel</code>. A stale <code>invoke</code>{" "}
        gets <code>STALE_NONCE</code>; stale <code>hello</code>/
        <code>cancel</code> are ignored. It is in-process integrity, not message
        authentication — there is no signing or MAC, which is acceptable because
        there is no network transport.
      </p>

      <H2 id="lifecycle">The invoke lifecycle</H2>
      <p>
        An <code>invoke</code> is processed through ordered checks, cheapest and
        most security-critical first:
      </p>
      <ol>
        <li>
          Size ≤ 1 MiB and strict JSON parse (<code>PAYLOAD_TOO_LARGE</code> /{" "}
          <code>INVALID_REQUEST</code>).
        </li>
        <li>
          Nonce validation (<code>STALE_NONCE</code>).
        </li>
        <li>
          Handshake — <code>hello</code> must have completed (
          <code>INVALID_REQUEST</code>).
        </li>
        <li>
          Request-id uniqueness within the session (<code>INVALID_REQUEST</code>
          ).
        </li>
        <li>
          Registry lookup (<code>UNKNOWN_COMMAND</code>).
        </li>
        <li>
          Capability evaluation — before deserialization (
          <code>CAPABILITY_DENIED</code>).
        </li>
        <li>
          In-flight limit ≤ 128 per window (<code>LIMIT_EXCEEDED</code>).
        </li>
        <li>
          Payload deserialization (<code>SERIALIZATION_ERROR</code>).
        </li>
        <li>
          Handler on a virtual thread with a timeout (30 s default, up to 24 h).
        </li>
      </ol>
      <p>
        Exactly one terminal <code>result</code> is sent per invocation:
        success, failure, timeout, and cancel race to set a single atomic
        terminal flag; only the winner sends a result.
      </p>

      <H2 id="events">Events and backpressure</H2>
      <p>
        Java-to-frontend, no reply. Emitted via <code>EventEmitter</code>,
        subscribed with <code>on(name, handler)</code>. The per-window queue is
        bounded at 256 by default, with an overflow policy: <code>REJECT</code>{" "}
        (default, surfaces an error to the emitter), <code>DROP_OLDEST</code>, or{" "}
        <code>COALESCE</code> by name. On navigation the old session is
        invalidated, a new nonce minted, in-flight calls cancelled, and queued
        events dropped; the client rejects pending promises locally with{" "}
        <code>NAVIGATION_RESET</code>.
      </p>
      <Callout variant="note">
        See <Link href="/docs/security-model">Security model</Link> for how the
        Java-side checks are defined and enforced.
      </Callout>
    </DocArticle>
  );
}
