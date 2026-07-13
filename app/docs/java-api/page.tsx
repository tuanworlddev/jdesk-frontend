import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Java API",
  description: "The public Java API surface of JDesk, module dev.jdesk.api.",
};

const HREF = "/docs/java-api";
const TOC = [
  { id: "application", label: "Application & bootstrap" },
  { id: "windows", label: "Windows" },
  { id: "commands", label: "Commands" },
  { id: "capabilities", label: "Capabilities" },
  { id: "events", label: "Events" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "threading", label: "Threading" },
  { id: "errors", label: "Errors" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Reference"
      title="Java API"
      description="The public Java API surface of JDesk, module dev.jdesk.api. Every type is dependency-free and stable; the runtime binds to it through an internal bootstrap."
      href={HREF}
      toc={TOC}
    >
      <p>
        Types are grouped by concern. Signatures are copied from source.
      </p>

      <H2 id="application">Application &amp; bootstrap</H2>
      <p>
        <code>JDeskApplication</code> is final and non-instantiable; obtain a
        builder with <code>JDeskApplication.builder()</code>. The fluent builder
        has setters including <code>id</code>, <code>commands</code>,{" "}
        <code>capabilities</code>, <code>window</code>, <code>lifecycle</code>,{" "}
        <code>devServerUrl</code>, <code>contentSecurityPolicy</code>,{" "}
        <code>assetRoute</code>, <code>singleInstance</code>, and{" "}
        <code>int run(String[] args)</code>. <code>ApplicationHandle</code> is
        the thread-safe control plane; <code>WindowHandle</code> controls a
        single window.
      </p>
      <CodeBlock
        lang="java"
        filename="ApplicationSpec"
        code={`record ApplicationSpec(
    String id,
    CommandRegistry commands,
    CapabilitySet capabilities,
    List<WindowConfig> windows,
    List<LifecycleListener> lifecycleListeners,
    Optional<String> devServerUrl,
    CommandRegistry frontendEvents,
    boolean singleInstance,
    Consumer<List<String>> activationHandler,
    Optional<String> contentSecurityPolicy,
    Map<String, AssetRoute> assetRoutes) {}`}
      />

      <H2 id="windows">Windows</H2>
      <p>
        <code>WindowConfig</code> is a record built with{" "}
        <code>WindowConfig.builder()</code> — <code>id</code>, <code>title</code>,{" "}
        <code>size</code>, <code>minSize</code>, <code>position</code>,{" "}
        <code>resizable</code>, <code>startMaximized</code>,{" "}
        <code>rememberBounds</code>, <code>entry</code>. <code>WindowId</code>{" "}
        grammar is <code>[a-zA-Z0-9._-]</code> of 1..64 chars; an invalid or
        null id yields <code>INVALID_REQUEST</code>.
      </p>
      <CodeBlock
        lang="java"
        filename="WindowConfig"
        code={`record WindowConfig(
    WindowId id, String title, int width, int height, boolean resizable, URI entry,
    int minWidth, int minHeight, boolean startMaximized, boolean rememberBounds) {}`}
      />

      <H2 id="commands">Commands</H2>
      <p>Commands are compile-time discovered.</p>
      <ul>
        <li>
          <code>@DesktopCommand</code> — target <code>METHOD</code>,{" "}
          <code>CLASS</code> retention; <code>String value()</code> is the wire
          name (1..128 chars, dot-separated lowerCamel).
        </li>
        <li>
          <code>@RequiresCapability</code> — <code>String value()</code>;
          evaluated before deserialization.
        </li>
        <li>
          <code>@PublicDesktopCommand</code> — no attributes; opts a command out
          of the capability requirement. A <code>@DesktopCommand</code> with
          neither is rejected by the processor.
        </li>
      </ul>
      <p>
        Related types: <code>CommandRegistry</code> (<code>of(...)</code>,{" "}
        <code>find</code>, <code>commandNames</code>, <code>size</code>),{" "}
        <code>CommandDefinition</code>, <code>CommandHandler</code> (runs on a
        virtual thread), and <code>InvocationContext</code> (<code>windowId</code>,{" "}
        <code>commandName</code>, <code>requestId</code>, <code>platform</code>,{" "}
        <code>application</code>, <code>events</code>, <code>isCancelled</code>).
      </p>
      <CodeBlock
        lang="java"
        filename="CommandDefinition"
        code={`record CommandDefinition(
    String name,
    Optional<String> requiredCapability,
    Class<?> requestType,
    Optional<Duration> timeout,
    CommandHandler handler) {}`}
      />

      <H2 id="capabilities">Capabilities</H2>
      <ul>
        <li>
          <code>CapabilitySet</code> (<code>isGranted</code>, <code>grants</code>,{" "}
          <code>of</code>, <code>empty</code>);
        </li>
        <li>
          <code>CapabilityGrant</code> —{" "}
          <code>{"record CapabilityGrant(String capability, Set<String> windows)"}</code>{" "}
          with <code>forAllWindows</code>;
        </li>
        <li>
          <code>PermissionDecision</code> — record with a boolean{" "}
          <code>allowed</code>, an <code>ErrorCode</code>, and a public{" "}
          <code>reason</code>, plus <code>allow()</code> and{" "}
          <code>deny(...)</code>.
        </li>
      </ul>

      <H2 id="events">Events</H2>
      <p>
        <code>EventEmitter</code> exposes{" "}
        <code>void emit(String eventName, Object payload)</code> and throws{" "}
        <code>LIMIT_EXCEEDED</code> when the queue is full and the policy is{" "}
        <code>REJECT</code>. <code>Subscription</code> has{" "}
        <code>void close()</code>, is idempotent, and extends{" "}
        <code>AutoCloseable</code>.
      </p>

      <H2 id="lifecycle">Lifecycle</H2>
      <p>
        <code>LifecycleListener</code> has <code>onStarting</code>,{" "}
        <code>onReady</code>, <code>onReady(ApplicationHandle)</code>,{" "}
        <code>onCloseRequested</code> (return false to veto),{" "}
        <code>onStopping</code>, and <code>onStopped</code> — all with no-op
        defaults. <code>LifecycleState</code> moves strictly forward:{" "}
        <code>NEW → STARTING → READY → STOPPING → STOPPED</code>.
      </p>

      <H2 id="threading">Threading</H2>
      <p>
        <code>UiDispatcher</code> marshals work onto the single UI thread.
      </p>
      <CodeBlock
        lang="java"
        filename="UiDispatcher"
        code={`public interface UiDispatcher {
    boolean isUiThread();
    void execute(Runnable action);
    <T> CompletionStage<T> submit(Callable<T> action);
    void assertUiThread();
}`}
      />
      <p>
        <code>execute</code> runs inline if already on the UI thread, else
        enqueues; <code>submit</code> returns a{" "}
        <code>CompletionStage</code>; <code>assertUiThread</code> throws{" "}
        <code>ILLEGAL_STATE</code> off-thread in dev and test, and logs and
        fails safe in production. See <a href="/docs/how-ipc-works">How IPC works</a>.
      </p>

      <H2 id="errors">Errors</H2>
      <p>
        <code>JDeskException</code> extends <code>RuntimeException</code> and
        carries an <code>ErrorCode</code>, a public message, and optional
        structured details surfaced to the frontend as <code>error.data</code>.{" "}
        <code>ErrorCode</code> enumerates the only identifiers allowed to cross
        the boundary. Every frontend-visible error is a code name plus a generic
        message; internal detail stays in Java logs.
      </p>
    </DocArticle>
  );
}
