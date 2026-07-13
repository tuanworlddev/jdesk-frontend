import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { CodeTabs } from "../../components/code-tabs";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Your first app",
  description:
    "Scaffold a JDesk app, run it, and trace one command round trip end to end.",
};

const HREF = "/docs/your-first-app";
const TOC = [
  { id: "scaffold", label: "1. Scaffold the project" },
  { id: "run", label: "2. Run it" },
  { id: "command", label: "3. Read the command" },
  { id: "capability", label: "4. See the capability grant" },
  { id: "frontend", label: "5. Trace the frontend call" },
  { id: "change", label: "6. Change the response" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Getting started"
      title="Your first app"
      description="Scaffold a JDesk app, run it, and trace one round trip end to end: a web page sends a name to a Java command, Java returns a typed record, and the page renders the reply."
      href={HREF}
      toc={TOC}
    >
      <p>
        This is a lesson, not a reference — follow the steps in order and you
        will end with a working app. Before you start, complete{" "}
        <a href="/docs/installation">Installation</a> so you have JDK 25+ and
        your operating system&rsquo;s system WebView in place. Because the JDesk
        artifacts are not on Maven Central yet, this tutorial builds against a
        local JDesk checkout passed as <code>--jdesk-source</code>.
      </p>

      <H2 id="scaffold">1. Scaffold the project</H2>
      <p>
        Create the app from the default <code>basic</code> template, then move
        into it:
      </p>
      <CodeBlock
        terminal
        code={`npx create-jdesk-app@latest my-first-app \\
  --package com.example.firstapp \\
  --jdesk-source /path/to/JDesk`}
      />
      <CodeBlock terminal code={`cd my-first-app`} />
      <p>These are the parts of the project you will touch live in this lesson:</p>
      <CodeBlock
        lang="text"
        filename="my-first-app/"
        code={`src/main/java/com/example/firstapp/
  Main.java                     # builds and runs the app
  GreetingService.java          # the greeting.greet command
src/main/resources/
  jdesk-capabilities.json       # grants greeting:use to the main window
ui/
  index.html                    # the form
  src/main.js                   # calls greeting.greet over the bridge`}
      />

      <H2 id="run">2. Run it</H2>
      <p>Launch the app:</p>
      <CodeTabs
        tabs={[
          { label: "macOS / Linux", os: "mac", terminal: true, code: `./gradlew run` },
          { label: "Windows", os: "windows", terminal: true, code: `.\\gradlew.bat run` },
        ]}
      />
      <p>
        A native window titled <code>my-first-app</code> opens with a text input
        pre-filled with <code>JDesk</code> and a <strong>Greet</strong> button.
        Click <strong>Greet</strong> and the page shows:
      </p>
      <CodeBlock lang="text" code={`Hello, JDesk!`} />
      <p>That reply came from Java.</p>

      <H2 id="command">3. Read the command</H2>
      <p>
        Open <code>GreetingService.java</code>:
      </p>
      <CodeBlock
        lang="java"
        filename="GreetingService.java"
        code={`package com.example.firstapp;

import dev.jdesk.api.DesktopCommand;
import dev.jdesk.api.InvocationContext;
import dev.jdesk.api.RequiresCapability;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

public final class GreetingService {
    public record Request(String name) {}
    public record Response(String message) {}

    @DesktopCommand("greeting.greet")
    @RequiresCapability("greeting:use")
    public CompletionStage<Response> greet(Request request, InvocationContext context) {
        String name = request.name() == null || request.name().isBlank()
                ? "world" : request.name().strip();
        return CompletableFuture.completedFuture(new Response("Hello, " + name + "!"));
    }
}`}
      />
      <p>Three things make this method a command:</p>
      <ul>
        <li>
          <code>@DesktopCommand(&quot;greeting.greet&quot;)</code> sets its wire
          name.
        </li>
        <li>
          <code>@RequiresCapability(&quot;greeting:use&quot;)</code> says the
          caller must hold that capability.
        </li>
        <li>
          The <code>Request</code> and <code>Response</code> records are the
          typed payloads.
        </li>
      </ul>
      <p>
        At compile time JDesk&rsquo;s annotation processor discovers this and
        generates <code>GreetingServiceCommands</code>, registered in{" "}
        <code>Main</code> via <code>GreetingServiceCommands.create(service)</code>
        . No runtime reflection. See{" "}
        <a href="/docs/defining-commands">Defining commands</a> for the full
        picture.
      </p>

      <H2 id="capability">4. See the capability grant</H2>
      <p>
        JDesk is deny-by-default: without a grant the call is rejected before
        your code runs. The generated project ships this grant:
      </p>
      <CodeBlock
        lang="json"
        filename="src/main/resources/jdesk-capabilities.json"
        code={`{
  "version": 1,
  "grants": [
    { "capability": "greeting:use", "windows": ["main"] }
  ]
}`}
      />
      <p>
        This grants <code>greeting:use</code> to the window whose id is{" "}
        <code>main</code> — the window <code>Main.java</code> creates. That is
        why clicking <strong>Greet</strong> works.
      </p>

      <H2 id="frontend">5. Trace the frontend call</H2>
      <p>
        Open <code>ui/src/main.js</code>. The page talks to Java over the bridge
        — the injected <code>window.__jdesk</code> channel. The exchange has four
        message kinds:
      </p>
      <CodeBlock
        lang="js"
        filename="ui/src/main.js"
        code={`document.addEventListener("jdesk-message", (event) => {
  const message = JSON.parse(event.detail);
  if (message.kind === "nonce") {
    nonce = message.nonce;
    window.__jdesk.post(JSON.stringify({
      v: 1, kind: "hello", client: "my-first-app", clientVersion: "0.1.0", nonce
    }));
  } else if (message.kind === "result") {
    const handler = pending.get(message.id);
    pending.delete(message.id);
    handler(message);
  }
});

document.querySelector("#greet-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = \`request-\${++nextId}\`;
  pending.set(id, (m) => { result.textContent = m.ok ? m.value.message : m.error.message; });
  window.__jdesk.post(JSON.stringify({
    v: 1, kind: "invoke", id, command: "greeting.greet", nonce,
    payload: { name: document.querySelector("#name").value }
  }));
});`}
      />
      <p>Read it as a sequence:</p>
      <ol>
        <li>
          <strong>nonce</strong> — on each navigation the runtime injects a fresh
          session nonce; the page stores it and echoes it in every message.
        </li>
        <li>
          <strong>hello</strong> — the page sends a <code>hello</code> envelope
          with the nonce; the runtime replies <code>helloAck</code>; required
          before any command.
        </li>
        <li>
          <strong>invoke</strong> — on submit the page posts an{" "}
          <code>invoke</code> envelope naming the command, a unique{" "}
          <code>id</code>, the nonce, and the JSON payload.
        </li>
        <li>
          <strong>result</strong> — Java runs <code>greet(...)</code> on a
          virtual thread and returns exactly one <code>result</code> envelope
          with the same <code>id</code>; on success it carries{" "}
          <code>value</code>; the page renders <code>message.value.message</code>
          .
        </li>
      </ol>
      <p>Here is the success envelope on the wire:</p>
      <CodeBlock
        lang="json"
        code={`{"v":1, "kind":"result", "id":"request-1", "ok":true, "value":{"message":"Hello, JDesk!"}}`}
      />
      <p>
        For the full message grammar, see{" "}
        <a href="/docs/how-ipc-works">the IPC protocol reference</a>.
      </p>

      <H2 id="change">6. Change the response</H2>
      <p>
        Edit <code>GreetingService.java</code> and change the response:
      </p>
      <CodeBlock
        lang="java"
        filename="GreetingService.java"
        code={`return CompletableFuture.completedFuture(
        new Response("Hey " + name + ", welcome to JDesk!"));`}
      />
      <p>Save, then run again:</p>
      <CodeTabs
        tabs={[
          { label: "macOS / Linux", os: "mac", terminal: true, code: `./gradlew run` },
          { label: "Windows", os: "windows", terminal: true, code: `.\\gradlew.bat run` },
        ]}
      />
      <p>
        Click <strong>Greet</strong>. Now it shows:
      </p>
      <CodeBlock lang="text" code={`Hey JDesk, welcome to JDesk!`} />
      <p>
        You changed Java, rebuilt, and saw the new reply render in the WebView —
        the core JDesk development loop. For frontend-only changes,{" "}
        <code>./gradlew jdeskDev</code> reloads the page without restarting Java.
      </p>

      <Callout variant="tip">
        Next, learn how Java pushes updates to the page with{" "}
        <a href="/docs/emitting-events">Emitting events</a>, or go deeper on the
        wire protocol with <a href="/docs/how-ipc-works">How IPC works</a>.
      </Callout>
    </DocArticle>
  );
}
