import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Emitting events",
  description:
    "Push data from Java to the frontend by emitting events, and subscribe to them in JavaScript.",
};

const HREF = "/docs/emitting-events";
const TOC = [
  { id: "emit", label: "Emit an event from Java" },
  { id: "subscribe", label: "Subscribe in JavaScript" },
  { id: "raw", label: "Without the client library" },
  { id: "ordering", label: "Ordering and the bounded queue" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="Emitting events"
      description="Commands let the frontend call Java; events let Java push data to the frontend. Emit an event from a command handler and subscribe to it in the web UI."
      href={HREF}
      toc={TOC}
    >
      <p>
        Commands let the frontend call Java; events let Java push data the other
        way — no reply expected.
      </p>

      <H2 id="emit">Emit an event from Java</H2>
      <p>
        Every handler&rsquo;s <code>InvocationContext</code> exposes{" "}
        <code>events()</code>, returning an <code>EventEmitter</code> that
        targets the invoking window. Call <code>emit(name, payload)</code>. The{" "}
        <code>eventName</code> is 1..128 chars (same grammar as command names);
        the <code>payload</code> is JSON-serialized and may be <code>null</code>.
      </p>
      <CodeBlock
        lang="java"
        filename="DownloadService.java"
        code={`@DesktopCommand("download.start")
@RequiresCapability("download:use")
public CompletionStage<Void> start(DownloadRequest request, InvocationContext context) {
    return CompletableFuture.runAsync(() -> {
        for (int pct = 0; pct <= 100; pct += 10) {
            transferChunk(request);
            context.events().emit("download.progress", new Progress(pct));
        }
        context.events().emit("download.done", null);
    }).thenApply(ignored -> null);
}`}
      />

      <H2 id="subscribe">Subscribe in JavaScript</H2>
      <p>
        Use <code>on(name, handler)</code> from <code>jdesk-client</code>; it
        returns an unsubscribe function.
      </p>
      <CodeBlock
        lang="ts"
        filename="ui/src/main.ts"
        code={`import { on } from "jdesk-client";

const off = on("download.progress", (payload) => {
  const { pct } = payload as { pct: number };
  progressBar.value = pct;
});`}
      />

      <H2 id="raw">Without the client library</H2>
      <p>
        Without the client library, events arrive as <code>jdesk-message</code>{" "}
        document events whose <code>detail</code> is the raw JSON envelope with{" "}
        <code>kind</code> <code>&quot;event&quot;</code>.
      </p>
      <CodeBlock
        lang="json"
        code={`{ "v": 1, "kind": "event", "event": "download.progress", "payload": { "pct": 42 } }`}
      />

      <H2 id="ordering">Ordering and the bounded queue</H2>
      <p>
        Events from one emitter to one window are delivered in enqueue order.
        Each window has a bounded queue (256 events by default). The overflow
        policies are:
      </p>
      <ul>
        <li>
          <code>REJECT</code> (default) — <code>emit</code> throws a{" "}
          <code>JDeskException</code> with <code>LIMIT_EXCEEDED</code>.
        </li>
        <li>
          <code>DROP_OLDEST</code> — the oldest queued event is discarded to make
          room.
        </li>
        <li>
          <code>COALESCE</code> — events are coalesced by name.
        </li>
      </ul>
      <p>
        Navigation drops queued events bound to the previous document.
      </p>
      <Callout variant="note">
        See <Link href="/docs/how-ipc-works">How IPC works</Link> for the full
        backpressure model.
      </Callout>
    </DocArticle>
  );
}
