import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { Comparison } from "../../components/comparison";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "What JDesk is, why it exists, and how it compares to Tauri and Electron.",
};

const HREF = "/docs/introduction";
const TOC = [
  { id: "mental-model", label: "The mental model" },
  { id: "why", label: "Why JDesk exists" },
  { id: "compare", label: "How it compares" },
  { id: "when", label: "When to use JDesk" },
  { id: "status", label: "Honest status" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Getting started"
      title="Introduction"
      description="JDesk builds cross-platform desktop apps from a Java 25 core and a web frontend, rendered in the operating system's own WebView. A small, native app with no bundled browser and no Rust."
      href={HREF}
      toc={TOC}
    >
      <p>
        If you know Tauri, the model will feel familiar: a compiled backend, a
        web UI, the system WebView, and a type-safe bridge between them. JDesk
        keeps that model but replaces Rust with the JVM, so your backend,
        plugins, and build are all Java and Gradle.
      </p>

      <H2 id="mental-model">The mental model</H2>
      <p>A JDesk app has three parts:</p>
      <ul>
        <li>
          <strong>A Java core</strong> — your commands, events, and application
          logic, running on the JVM with virtual threads. This is where the real
          work happens.
        </li>
        <li>
          <strong>A web frontend</strong> — HTML/CSS/JS built with any stack
          (React, Vue, Svelte, or none). It runs in the system WebView and talks
          to Java over a typed, asynchronous bridge.
        </li>
        <li>
          <strong>A platform adapter</strong> — a per-OS module that creates the
          native window and WebView using only documented OS APIs, through
          Java&rsquo;s Foreign Function &amp; Memory API. You never touch it
          directly.
        </li>
      </ul>
      <p>
        The frontend calls Java by invoking <code>commands</code>; Java pushes
        data to the frontend by emitting <code>events</code>. Every command runs
        on a virtual thread, never on the UI thread, and every call is
        authorized against a deny-by-default capability model before your code
        runs.
      </p>
      <CodeBlock
        lang="text"
        filename="the round trip"
        code={`  Web frontend  ──invoke──▶  Java command  (virtual thread)
  (system WebView)  ◀─event──  Java core
        │
        └─ assets served over jdesk://app/  (no HTTP server)`}
      />

      <H2 id="why">Why JDesk exists</H2>
      <p>
        <strong>No bundled Chromium.</strong> Electron ships a full browser with
        every app, costing 100+ MB per install and a large memory footprint.
        JDesk uses the WebView already on the user&rsquo;s machine, so apps are
        small.
      </p>
      <p>
        <strong>No Rust.</strong> Tauri gets small binaries by compiling a Rust
        backend. JDesk gets them from a trimmed JVM runtime image (
        <code>jlink</code>) instead, so teams that already work in Java — Spring,
        Android, Gradle — can build desktop apps without learning a new systems
        language.
      </p>
      <p>
        <strong>No Node.js at runtime.</strong> The frontend is static files
        served over a custom <code>jdesk://app/</code> scheme — there is no local
        web server in production. Node is only a build-time tool, and only if
        your chosen frontend needs it.
      </p>
      <p>
        <strong>Type-safe, compile-time IPC.</strong> Commands are discovered by
        a Java annotation processor at compile time, which also generates a typed
        TypeScript client. There is no runtime reflection and no hand-written
        glue that can drift out of sync.
      </p>
      <p>
        <strong>Secure by default.</strong> Every command requires an explicit
        capability grant. Navigation is locked to the app origin, popups are
        denied, and the asset protocol rejects path traversal. Security is
        enforced in Java, never trusted to the frontend.
      </p>

      <H2 id="compare">How it compares</H2>
      <Comparison />
      <p className="mt-6">
        JDesk trades Electron&rsquo;s guarantee of one identical rendering engine
        on every OS for smaller apps that use each platform&rsquo;s native
        WebView — the same trade-off Tauri makes. If pixel- and feature-identical
        rendering across every OS is a hard requirement, Electron is still the
        safer choice.
      </p>

      <H2 id="when">When to use JDesk</H2>
      <p>
        Reach for JDesk when you want a small native desktop app, your team is
        comfortable in Java and Gradle, and you are happy building the UI with
        web technology. It fits internal tools, developer tools, and productivity
        apps especially well.
      </p>
      <p>
        Consider something else if you need mobile support (JDesk is desktop-only
        for v1), if you cannot accept per-OS WebView differences, or if your app
        must run without any JVM at all.
      </p>

      <H2 id="status">Honest status</H2>
      <Callout variant="status">
        JDesk is <strong>under active development</strong>. The core, all three
        platform adapters, the command/event bridge, capabilities, code
        generation, the
        Gradle plugin, and packaging are implemented and verified on real system
        WebViews. Signed release packages and a few conveniences are still in
        progress. The verification matrix is the source of truth for what is
        proven on which platform, and these docs flag anything unfinished rather
        than overstating it.
      </Callout>
    </DocArticle>
  );
}
