import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { CodeTabs } from "../../components/code-tabs";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "The dev loop & HMR",
  description:
    "A fast edit-refresh cycle: frontend HMR in the WebView, and automatic Java rebuild-and-restart.",
};

const HREF = "/docs/the-dev-loop";
const TOC = [
  { id: "doctor", label: "Check your environment" },
  { id: "start", label: "Start the loop" },
  { id: "frontend", label: "Frontend changes: HMR" },
  { id: "java", label: "Java changes: controlled restart" },
  { id: "static", label: "Static frontends: no Node, still hot" },
  { id: "aliases", label: "Task aliases" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="The dev loop & HMR"
      description="Get a fast edit-refresh cycle: frontend changes hot-reload in the WebView, and Java changes rebuild and restart the app automatically, via the jdeskDev task."
      href={HREF}
      toc={TOC}
    >
      <p>
        The dev loop is driven by the <code>dev.jdesk.application</code>{" "}
        plugin&rsquo;s <code>jdeskDev</code> task and the <code>frontend {"{ }"}</code>{" "}
        / <code>development {"{ }"}</code> configuration behind it.
      </p>

      <H2 id="doctor">Check your environment</H2>
      <p>
        Check your environment first with <code>jdeskDoctor</code>.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew jdeskDoctor`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat jdeskDoctor`,
          },
        ]}
      />
      <p>
        It verifies the JDK toolchain (&gt;= 25), the presence of{" "}
        <code>jlink</code> and <code>jpackage</code>, OS/arch, the platform
        WebView runtime (macOS <code>WebKit.framework</code>; Windows WebView2
        registry; Linux WebKitGTK 4.1 via <code>pkg-config</code>), the frontend
        tool on <code>PATH</code>, and a valid capabilities file. It collects
        every problem and fails once.
      </p>

      <H2 id="start">Start the loop</H2>
      <p>
        Install the frontend dependencies once (framework templates only), then
        start the loop.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `npm install --prefix ui
./gradlew jdeskDev`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `npm install --prefix ui
.\\gradlew.bat jdeskDev`,
          },
        ]}
      />
      <p>
        <code>jdeskDev</code> starts the frontend <code>devCommand</code>, probes{" "}
        <code>devUrl</code>, launches the supervised Java app with{" "}
        <code>-Djdesk.dev=true</code> and{" "}
        <code>-Djdesk.devUrl=&lt;devUrl&gt;</code>, watches the Java/resource
        roots and restarts after a successful rebuild, and cleans up child
        process trees on exit.
      </p>

      <H2 id="frontend">Frontend changes: HMR</H2>
      <p>
        Edits under <code>ui/</code> hot-reload through Vite HMR; Java keeps
        running. To keep UI state across a Java restart, note that{" "}
        <code>localStorage</code> survives the swap (persisted per origin) — save
        on change and restore at startup.
      </p>

      <H2 id="java">Java changes: controlled restart</H2>
      <p>
        The <code>development {"{ }"}</code> block controls Java reload:
      </p>
      <ul>
        <li>
          <code>javaReload</code> (default <code>true</code>)
        </li>
        <li>
          <code>reloadDebounceMillis</code> (default <code>300</code>)
        </li>
        <li>
          <code>reloadCommand</code> (defaults to the <code>classes</code> task)
        </li>
        <li>
          <code>reloadSources</code> (extra source roots to watch)
        </li>
      </ul>
      <p>
        The app is swapped only after a successful compile — a failed rebuild
        keeps the current process alive while you fix the source.
      </p>
      <CodeBlock
        lang="kotlin"
        filename="build.gradle.kts"
        code={`jdesk {
    development {
        javaReload.set(true)
        reloadDebounceMillis.set(300)
        // reloadCommand.set(listOf("./gradlew", "classes"))
        // reloadSources.from(rootProject.file("another-module/src/main"))
    }
}`}
      />

      <H2 id="static">Static frontends: no Node, still hot</H2>
      <p>
        The basic and structured templates leave <code>devCommand</code>/
        <code>devUrl</code> unset and keep a <code>buildCommand</code> (
        <code>java Build.java</code>). <code>jdeskDev</code> then runs in
        static-frontend mode: it builds once, launches with{" "}
        <code>-Djdesk.dev=true</code> and{" "}
        <code>-Djdesk.assets.dir=&lt;distDirectory&gt;</code>, watches sources,
        re-runs the <code>buildCommand</code>, and the runtime&rsquo;s dev-mode
        asset watcher reloads the page — a zero-Node hot loop. In a structured
        build, add the domain/application/infrastructure roots to{" "}
        <code>reloadSources</code> and run the dev task from the desktop module.
      </p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew :desktop:jdeskDev`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat :desktop:jdeskDev`,
          },
        ]}
      />

      <H2 id="aliases">Task aliases</H2>
      <p>The plugin registers short task aliases:</p>
      <ul>
        <li>
          <code>run</code> (build frontend + launch)
        </li>
        <li>
          <code>dev</code> → <code>jdeskDev</code>
        </li>
        <li>
          <code>doctor</code> → <code>jdeskDoctor</code>
        </li>
        <li>
          <code>bindings</code> → <code>jdeskGenerateBindings</code>
        </li>
        <li>
          <code>pkg</code> → <code>jdeskPackage</code>
        </li>
      </ul>
      <p>
        The basic template registers <code>run</code>/<code>doctor</code>/
        <code>bindings</code>/<code>pkg</code>; the Vite templates also register{" "}
        <code>dev</code>.
      </p>
    </DocArticle>
  );
}
