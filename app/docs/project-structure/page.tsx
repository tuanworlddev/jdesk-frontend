import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { CodeTabs } from "../../components/code-tabs";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Project structure",
  description:
    "A file-by-file tour of the project that create-jdesk-app generates.",
};

const HREF = "/docs/project-structure";
const TOC = [
  { id: "basic-layout", label: "The basic layout" },
  { id: "build-files", label: "Build and project files" },
  { id: "java", label: "Java sources" },
  { id: "resources", label: "Resources" },
  { id: "frontend", label: "Frontend (ui/)" },
  { id: "structured", label: "The structured template" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Getting started"
      title="Project structure"
      description="A file-by-file tour of the project that create-jdesk-app generates. It assumes the basic template with package com.example.myapp, then contrasts the structured template."
      href={HREF}
      toc={TOC}
    >
      <p>
        This is a reference: it describes what each file is and does. Scaffold
        one to follow along (see <a href="/docs/installation">Installation</a>).
      </p>

      <H2 id="basic-layout">The basic layout</H2>
      <CodeBlock
        lang="text"
        filename="my-app/"
        code={`build.gradle.kts                  # Gradle build: plugin, deps, jdesk config
settings.gradle.kts               # project name, repositories
gradlew, gradlew.bat              # Gradle wrapper (run tasks with this)
gradle/wrapper/                   # wrapper jar + properties
src/main/java/com/example/myapp/
  Main.java                       # application entry point
  GreetingService.java            # a command service
src/main/resources/
  jdesk-capabilities.json         # capability grants (deny-by-default)
ui/
  index.html                      # the page shell
  package.json                    # Vite scripts (dev/build)
  Build.java                      # production asset build (no Node)
  src/main.js                     # the bridge client
  src/style.css                   # styles`}
      />

      <H2 id="build-files">Build and project files</H2>
      <ul>
        <li>
          <code>build.gradle.kts</code> — applies the{" "}
          <code>dev.jdesk.application</code> plugin, pins the Java 25 toolchain,
          declares dependencies on <code>dev.jdesk:jdesk-api</code> and{" "}
          <code>dev.jdesk:jdesk-runtime</code>, selects the per-OS platform
          adapter (<code>dev.jdesk:jdesk-platform-&lt;os&gt;</code>) from{" "}
          <code>os.name</code>, and configures the app in a{" "}
          <code>jdesk {"{ }"}</code> block — <code>applicationId</code>,{" "}
          <code>mainClass</code>, and a <code>frontend {"{ }"}</code> block
          pointing at <code>ui/</code>. It also applies Gradle&rsquo;s
          application plugin so <code>./gradlew run</code> launches the app, and
          registers short task aliases (<code>doctor</code>,{" "}
          <code>bindings</code>, <code>pkg</code>).
        </li>
      </ul>
      <p>
        The single-module templates (basic, vanilla, react, vue, svelte) are
        classpath apps — no <code>module-info.java</code>. The structured
        template is modular.
      </p>
      <ul>
        <li>
          <code>settings.gradle.kts</code> — sets{" "}
          <code>rootProject.name</code> and declares plugin and dependency
          repositories. With <code>--jdesk-source</code> it also{" "}
          <code>includeBuild(...)</code>s your local JDesk checkout as a
          composite build.
        </li>
        <li>
          <code>gradlew</code> / <code>gradlew.bat</code> /{" "}
          <code>gradle/wrapper/</code> — the Gradle wrapper; always invoke
          Gradle through it.
        </li>
        <li>
          <code>.gitignore</code> — ignores build output.
        </li>
      </ul>

      <H2 id="java">Java sources</H2>
      <p>
        The single-module templates have no <code>module-info.java</code> — they
        run on the classpath. The structured template is modular and ships a{" "}
        <code>module-info.java</code> per module, like:
      </p>
      <CodeBlock
        lang="java"
        filename="module-info.java"
        code={`module com.example.myapp {
    requires dev.jdesk.api;
    requires dev.jdesk.runtime;
    requires static com.fasterxml.jackson.databind;

    opens com.example.myapp to com.fasterxml.jackson.databind;
}`}
      />
      <ul>
        <li>
          <code>Main.java</code> — the entry point. It builds a{" "}
          <code>JDeskApplication</code> with an id, the generated command
          registry (<code>GreetingServiceCommands.create(...)</code>), the
          capability set loaded from <code>jdesk-capabilities.json</code>, and
          one <code>WindowConfig</code>, then calls <code>run(args)</code>. It
          also honors <code>-Djdesk.dev</code> / <code>-Djdesk.devUrl</code> so{" "}
          <code>jdeskDev</code> can point it at the dev server.
        </li>
        <li>
          <code>GreetingService.java</code> — a command service: a plain class
          whose method is annotated with{" "}
          <code>{`@DesktopCommand("greeting.greet")`}</code> and{" "}
          <code>{`@RequiresCapability("greeting:use")`}</code>. Request and
          response
          are public records. At compile time the annotation processor turns
          this into <code>GreetingServiceCommands</code> plus TypeScript
          bindings.
        </li>
      </ul>

      <H2 id="resources">Resources</H2>
      <p>
        <code>src/main/resources/jdesk-capabilities.json</code> is the
        capability grant list. JDesk is deny-by-default. The generated file
        grants <code>greeting:use</code> to the main window.
      </p>
      <CodeBlock
        lang="json"
        filename="jdesk-capabilities.json"
        code={`{
  "version": 1,
  "grants": [
    { "capability": "greeting:use", "windows": ["main"] }
  ]
}`}
      />

      <H2 id="frontend">Frontend (ui/)</H2>
      <ul>
        <li>
          <code>ui/index.html</code> — the page shell (the form and a result
          element), loads <code>src/main.js</code> as a module.
        </li>
        <li>
          <code>ui/src/main.js</code> — the frontend logic; talks to Java over
          the bridge (<code>window.__jdesk</code>): completes the handshake,
          then on submit invokes <code>greeting.greet</code> and renders the
          response. Imports <code>style.css</code>.
        </li>
        <li>
          <code>ui/src/style.css</code> — the page styles.
        </li>
        <li>
          <code>ui/package.json</code> — declares the Vite dev/build scripts.
          The dev script serves the frontend on{" "}
          <code>http://127.0.0.1:5173</code>.
        </li>
        <li>
          <code>ui/Build.java</code> — the production asset build. A single-file
          Java program that copies <code>index.html</code>,{" "}
          <code>main.js</code>, and <code>style.css</code> into{" "}
          <code>ui/dist/</code> and rewrites the script path. So a production
          build (and <code>./gradlew run</code>) needs no Node.{" "}
          <code>ui/dist/</code> is what the plugin packs into the app and serves
          over <code>jdesk://app/</code>.
        </li>
      </ul>

      <H2 id="structured">The structured template</H2>
      <p>
        The structured template targets larger apps by splitting into four
        Gradle modules plus a shared frontend, following
        domain/application/infrastructure/desktop layering.
      </p>
      <CodeBlock
        lang="text"
        filename="my-app/"
        code={`settings.gradle.kts   # include("domain","application","infrastructure","desktop")
build.gradle.kts      # base build, shared group/version
domain/               # pure domain records (e.g. Greeting)
application/          # use-case interfaces (e.g. GreetingUseCase)
infrastructure/       # implementations (e.g. SystemGreetingUseCase)
desktop/              # composition root: Main, command services, capabilities
ui/                   # shared frontend (same files as basic)`}
      />
      <ul>
        <li>
          <code>domain</code> — plain records with no framework dependency.
          Exports its package; depends on nothing.
        </li>
        <li>
          <code>application</code> — use-case interfaces that the domain drives.
          Requires <code>domain</code> transitively.
        </li>
        <li>
          <code>infrastructure</code> — concrete implementations (
          <code>SystemGreetingUseCase</code> implements{" "}
          <code>GreetingUseCase</code>). Requires <code>application</code>.
        </li>
        <li>
          <code>desktop</code> — the composition root and the only module that
          applies the <code>dev.jdesk.application</code> plugin. Holds{" "}
          <code>Main</code>, a command service delegating to the use case,{" "}
          <code>module-info.java</code>, and{" "}
          <code>jdesk-capabilities.json</code>. Its <code>jdesk {"{ }"}</code>{" "}
          block sets <code>mainModule</code> to <code>&lt;id&gt;.desktop</code>{" "}
          and lists other modules under{" "}
          <code>development.reloadSources</code>.
        </li>
      </ul>
      <p>
        Run the structured dev loop from the desktop module:
      </p>
      <CodeTabs
        tabs={[
          { label: "macOS / Linux", os: "mac", terminal: true, code: `./gradlew :desktop:jdeskDev` },
          { label: "Windows", os: "windows", terminal: true, code: `.\\gradlew.bat :desktop:jdeskDev` },
        ]}
      />
      <p>
        Both templates share the same command/capability/frontend model.
      </p>
    </DocArticle>
  );
}
