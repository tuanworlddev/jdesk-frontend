import type { Metadata } from "next";
import { CodeBlock } from "../../components/code-block";
import { CodeTabs } from "../../components/code-tabs";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2, H3 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Installation",
  description:
    "Set up your machine for JDesk and scaffold a new project with create-jdesk-app.",
};

const HREF = "/docs/installation";
const TOC = [
  { id: "prerequisites", label: "Prerequisites" },
  { id: "scaffold", label: "Scaffold a project" },
  { id: "templates", label: "The template menu" },
  { id: "consume", label: "Consuming the framework" },
  { id: "run", label: "Run the app" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Getting started"
      title="Installation"
      description="Install the prerequisites, scaffold a project with create-jdesk-app, and run the generated app on your operating system."
      href={HREF}
      toc={TOC}
    >
      <H2 id="prerequisites">Prerequisites</H2>

      <H3>JDK 25+ (required)</H3>
      <p>
        JDesk apps are built and run with the JDK — you need{" "}
        <strong>JDK 25 or newer</strong> to scaffold, build, and run. The
        scaffolder looks for a JDK via <code>JAVA_HOME</code> first, then{" "}
        <code>java</code> on your <code>PATH</code>. Verify your toolchain:
      </p>
      <CodeBlock terminal code={`java -version   # must report 25 or higher`} />
      <p>
        Set <code>JAVA_HOME</code> if you keep multiple JDKs:
      </p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `export JAVA_HOME=/path/to/jdk-25`,
          },
          {
            label: "Windows (PowerShell)",
            os: "windows",
            terminal: true,
            code: `$env:JAVA_HOME = "C:\\path\\to\\jdk-25"`,
          },
        ]}
      />

      <H3>A system WebView for your OS (required to run)</H3>
      <p>
        JDesk renders your frontend in the operating system&rsquo;s own WebView —
        there is no bundled browser. Each OS needs its WebView runtime present:
      </p>
      <table>
        <thead>
          <tr>
            <th>OS</th>
            <th>WebView runtime</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Windows</td>
            <td>Microsoft Edge WebView2</td>
            <td>Ships / updates on Windows 10 1809+; install it if absent.</td>
          </tr>
          <tr>
            <td>macOS</td>
            <td>System WebKit (WKWebView)</td>
            <td>Part of macOS 13 Ventura or newer; nothing to install.</td>
          </tr>
          <tr>
            <td>Linux</td>
            <td>WebKitGTK 4.1</td>
            <td>
              <code>sudo apt-get install libwebkit2gtk-4.1-0</code>
            </td>
          </tr>
        </tbody>
      </table>

      <H3>Node.js (optional)</H3>
      <p>
        Node.js is <strong>not</strong> required to run a JDesk app — the
        generated application is pure Java and a system WebView. You need Node
        only for frontend tooling: the <code>react</code>, <code>vue</code>,{" "}
        <code>svelte</code>, and <code>vanilla</code> templates build with Vite.
        The <code>basic</code> template&rsquo;s production build uses a plain Java
        build script, so <code>./gradlew run</code> works without Node.
      </p>

      <H2 id="scaffold">Scaffold a project</H2>
      <p>
        Create a new project with <code>create-jdesk-app</code>. Both forms
        resolve to the same package:
      </p>
      <CodeBlock terminal code={`npm create jdesk-app@latest my-app
npx create-jdesk-app@latest my-app`} />
      <p>Run it with no project name for an interactive prompt:</p>
      <CodeBlock terminal code={`npm create jdesk-app@latest`} />

      <H2 id="templates">The template menu</H2>
      <p>The interactive prompt lists these templates. The default is Basic:</p>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Id</th>
            <th>What you get</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic</td>
            <td>
              <code>basic</code>
            </td>
            <td>Single Gradle module, plain HTML/JS. Great for learning.</td>
          </tr>
          <tr>
            <td>Vanilla + Vite</td>
            <td>
              <code>vanilla</code>
            </td>
            <td>Single module, Vite + vanilla TypeScript.</td>
          </tr>
          <tr>
            <td>React + Vite</td>
            <td>
              <code>react</code>
            </td>
            <td>Single module, Vite + React.</td>
          </tr>
          <tr>
            <td>Vue + Vite</td>
            <td>
              <code>vue</code>
            </td>
            <td>Single module, Vite + Vue.</td>
          </tr>
          <tr>
            <td>Svelte + Vite</td>
            <td>
              <code>svelte</code>
            </td>
            <td>Single module, Vite + Svelte.</td>
          </tr>
          <tr>
            <td>Structured</td>
            <td>
              <code>structured</code>
            </td>
            <td>Multi-module: domain / application / infrastructure / desktop.</td>
          </tr>
        </tbody>
      </table>
      <p>Pick one non-interactively with `--template`:</p>
      <CodeBlock
        terminal
        code={`npx create-jdesk-app@latest my-app --template react --package com.acme.myapp`}
      />

      <H2 id="consume">Consuming the framework today</H2>
      <Callout variant="status" title="Consuming the framework">
        The <code>create-jdesk-app</code> CLI is on npm and the{" "}
        <code>dev.jdesk:*</code> libraries are published to GitHub Packages
        (v0.1.1) — but not yet to Maven Central, which requires authentication to
        consume. Until then, build against a local checkout with{" "}
        <code>--jdesk-source</code>, add the GitHub Packages repository with a{" "}
        <code>read:packages</code> token, or run{" "}
        <code>./gradlew publishToMavenLocal</code> from a checkout.
      </Callout>
      <CodeBlock
        terminal
        code={`npx create-jdesk-app@latest my-app --jdesk-source /path/to/JDesk`}
      />

      <H2 id="run">Run the app</H2>
      <p>
        Move into the project and launch it. The generated build auto-detects
        your OS and selects the matching platform adapter — no extra flag needed:
      </p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `cd my-app
./gradlew run`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `cd my-app
.\\gradlew.bat run`,
          },
        ]}
      />
      <p>
        The <code>run</code> task builds the frontend, packs the assets, and
        opens a native window. On macOS it adds <code>-XstartOnFirstThread</code>{" "}
        automatically. To develop with hot reload, install the frontend
        dependencies once and start the dev loop:
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
    </DocArticle>
  );
}
