import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Streaming binary data",
  description:
    "Return a BinaryStream from a command and consume it in the page with invokeStream — a pull-based protocol with real backpressure.",
};

const HREF = "/docs/streaming-binary-data";
const TOC = [
  { id: "java", label: "Java side: return a BinaryStream" },
  { id: "js", label: "JS side: consume a ReadableStream" },
  { id: "backpressure", label: "Backpressure and cancellation" },
  { id: "when", label: "When to use what" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="Streaming binary data"
      description="Command results are single JSON envelopes capped at 1 MiB — the wrong shape for files or exports. For those, return a BinaryStream from a handler and consume it with invokeStream, a pull-based protocol with real backpressure."
      href={HREF}
      toc={TOC}
    >
      <p>
        Command results are single JSON envelopes capped at 1 MiB, which is the
        wrong shape for file contents, exports, or anything measured in
        megabytes. For those, return a <code>BinaryStream</code> and consume it
        with <code>invokeStream</code>.
      </p>

      <Callout variant="note">
        Verified live on macOS &mdash; 2 GiB streamed through the real
        WKWebView bridge in 8192 pulls at ~150 MiB/s with zero corruption, and
        cancellation closes the stream token immediately.
      </Callout>

      <H2 id="java">Java side: return a BinaryStream</H2>
      <p>Return a BinaryStream from the handler.</p>
      <CodeBlock
        lang="java"
        filename="MediaService (registry form)"
        code={`new CommandDefinition("media.export", Optional.of("media:read"),
        ExportRequest.class, Optional.of(Duration.ofMinutes(10)),
        (request, context) -> {
            Path file = resolveExport((ExportRequest) request);
            try {
                return CompletableFuture.completedFuture(
                        BinaryStream.of(file, "application/zip"));
            } catch (IOException e) {
                throw new JDeskException(ErrorCode.INTERNAL, "Export unavailable");
            }
        });`}
      />
      <p>
        The handler completes immediately with a descriptor; the runtime
        registers the stream and opens the <code>InputStream</code> lazily on
        the first pull. Streams are scoped to the current navigation &mdash; a
        reload or crash recovery closes every open stream.
      </p>

      <H2 id="js">JS side: consume a ReadableStream</H2>
      <p>Consume a ReadableStream.</p>
      <CodeBlock
        lang="ts"
        filename="ui/src/main.ts"
        code={`import { invokeStream } from "jdesk-client";

const result = await invokeStream("media.export", { id: 42 });
// result.length, result.contentType, result.fileName
const reader = result.stream.getReader();
for (;;) {
  const { done, value } = await reader.read();   // one pull per demand
  if (done) break;
  consume(value);                                 // Uint8Array
}`}
      />

      <H2 id="backpressure">Backpressure and cancellation</H2>
      <p>
        Each <code>read()</code> issues one <code>jdesk.stream.pull</code> for
        up to <code>chunkBytes</code> (default and maximum 256 KiB); the runtime
        never sends data the page has not asked for &mdash; that is the
        backpressure. Call <code>result.stream.cancel()</code> to stop early;
        the runtime frees the stream and subsequent pulls fail with{" "}
        <code>INVALID_REQUEST</code>.
      </p>
      <p>
        Chunks travel base64-encoded inside JSON envelopes (~33% inflation); at
        the measured ~150 MiB/s effective throughput this is rarely the
        bottleneck for desktop use cases.
      </p>

      <H2 id="when">When to use what</H2>
      <table>
        <thead>
          <tr>
            <th>Payload</th>
            <th>Mechanism</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Structured data &lt; 1 MiB</td>
            <td>Plain command result.</td>
          </tr>
          <tr>
            <td>Progress / status pushes</td>
            <td>
              <code>context.events().emit(...)</code> (
              <a href="/docs/emitting-events">Emitting events</a>).
            </td>
          </tr>
          <tr>
            <td>Files, exports, blobs of any size</td>
            <td>
              <code>BinaryStream</code> + <code>invokeStream</code>.
            </td>
          </tr>
          <tr>
            <td>Large packaged media for &lt;video&gt; / &lt;audio&gt;</td>
            <td>
              Serve as an asset; the pipeline answers Range requests with 206 (
              <a href="/docs/serving-assets">Serving assets</a>).
            </td>
          </tr>
        </tbody>
      </table>
    </DocArticle>
  );
}
