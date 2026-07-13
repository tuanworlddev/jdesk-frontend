import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Defining commands",
  description:
    "Declare a @DesktopCommand method, wire its generated registry into your app, and call it from JavaScript.",
};

const HREF = "/docs/defining-commands";
const TOC = [
  { id: "declare", label: "Declare the command" },
  { id: "shapes", label: "Supported method shapes" },
  { id: "types", label: "Request and response types" },
  { id: "virtual-threads", label: "Just block — you're on a virtual thread" },
  { id: "wire", label: "Wire the generated registry" },
  { id: "call", label: "Call it from JavaScript" },
  { id: "rejects", label: "What the processor rejects" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="Defining commands"
      description="Commands are how the web frontend calls Java. Declare a @DesktopCommand method, wire its generated registry into your application, and call it from the frontend."
      href={HREF}
      toc={TOC}
    >
      <p>
        Commands are how the web frontend calls Java. This guide covers
        declaring a command, wiring its registry, and calling it.
      </p>

      <H2 id="declare">Declare the command</H2>
      <p>
        Add a <code>@DesktopCommand(&quot;area.name&quot;)</code> method to a
        public, top-level service class; the method must be a public instance
        method. The wire name is 1..128 chars of dot-separated lowerCamel
        segments. Every command must declare a capability decision: either{" "}
        <code>@RequiresCapability(&quot;name&quot;)</code> or opt out with{" "}
        <code>@PublicDesktopCommand</code>. A command with neither (or both) is
        a compile-time error — commands are deny-by-default.
      </p>
      <CodeBlock
        lang="java"
        filename="GreetingService.java"
        code={`@DesktopCommand("greeting.greet")
@RequiresCapability("greeting:use")
public CompletionStage<GreetResponse> greet(GreetRequest request, InvocationContext context) {
    String name = request.name() == null || request.name().isBlank()
            ? "world" : request.name().strip();
    return CompletableFuture.completedFuture(new GreetResponse("Hello, " + name + "!"));
}`}
      />

      <H2 id="shapes">Supported method shapes</H2>
      <p>
        Handlers always return <code>{"CompletionStage<Res>"}</code>. Parameter
        lists may be:
      </p>
      <ul>
        <li>
          <code>(Request, InvocationContext)</code>
        </li>
        <li>
          <code>(InvocationContext)</code>
        </li>
        <li>
          <code>()</code>
        </li>
      </ul>

      <H2 id="types">Request and response types</H2>
      <ul>
        <li>
          <strong>Request:</strong> a public record, a <code>String</code>, or a
          boxed primitive.
        </li>
        <li>
          <strong>Response:</strong> a public record, <code>String</code>, boxed
          primitive, or <code>Void</code>.
        </li>
        <li>
          Records may nest records and use <code>{"List<X>"}</code>,{" "}
          <code>{"Map<String, X>"}</code>, <code>{"Optional<X>"}</code>. Wrap
          collections in a record rather than returning them directly.
        </li>
      </ul>

      <H2 id="virtual-threads">Just block — you&rsquo;re on a virtual thread</H2>
      <p>
        Every handler runs on a fresh virtual thread, off the UI thread, with a
        default 30-second timeout. Blocking I/O is the intended pattern — just
        block.
      </p>
      <Callout variant="warning">
        Do NOT wrap work in <code>CompletableFuture.supplyAsync(...)</code>; it
        starves the common ForkJoinPool. Compose on the returned{" "}
        <code>CompletionStage</code> instead.
      </Callout>

      <H2 id="wire">Wire the generated registry</H2>
      <p>
        <code>jdesk-codegen</code> generates <code>&lt;Service&gt;Commands</code>{" "}
        with a static <code>create(...)</code> returning a{" "}
        <code>CommandRegistry</code>. Pass it to the application builder.
        Multiple services in a package also get a{" "}
        <code>JDeskCommands.combine(...)</code> aggregator. Duplicate wire names
        are rejected at compile time.
      </p>
      <CodeBlock
        lang="java"
        filename="Main.java"
        code={`int exit = JDeskApplication.builder()
        .id("com.example.app")
        .commands(GreetingServiceCommands.create(greetings))
        .capabilities(Capabilities.fromResource(
                Main.class.getModule(), "jdesk-capabilities.json"))
        .window(WindowConfig.builder()
                .id("main").title("Example").size(960, 680)
                .entry("jdesk://app/index.html").build())
        .run(args);`}
      />

      <H2 id="call">Call it from JavaScript</H2>
      <p>
        Use the generated typed client, or the untyped <code>invoke</code> from{" "}
        <code>jdesk-client</code>. Failed calls reject with a{" "}
        <code>JDeskError</code> carrying a code like <code>CAPABILITY_DENIED</code>{" "}
        or <code>TIMEOUT</code>.
      </p>
      <CodeBlock
        lang="ts"
        filename="ui/src/main.ts"
        code={`import { commands } from "./jdesk-ts/commands";

const response = await commands.greeting.greet({ name: "Tuan" });`}
      />

      <H2 id="rejects">What the processor rejects</H2>
      <p>The annotation processor rejects:</p>
      <ul>
        <li>missing or dual capability annotations;</li>
        <li>non-public or static methods;</li>
        <li>
          overloaded <code>@DesktopCommand</code> methods;
        </li>
        <li>wrong return types;</li>
        <li>
          unsupported request/response types (raw <code>Object</code>,{" "}
          <code>Class</code>, arrays, <code>Throwable</code>,{" "}
          <code>MemorySegment</code>, generic/recursive records, non-String map
          keys);
        </li>
        <li>and duplicate wire names.</li>
      </ul>

      <Callout variant="note">
        See <a href="/docs/capabilities">Capabilities &amp; permissions</a> for
        how grants are declared, and{" "}
        <a href="/docs/emitting-events">Emitting events</a> for pushing updates
        from Java to the page.
      </Callout>
    </DocArticle>
  );
}
