import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "The CLI",
  description:
    "create-jdesk-app scaffolds projects; the jdesk CLI generates projects and drives Gradle builds.",
};

const HREF = "/docs/cli";
const TOC = [
  { id: "create-jdesk-app", label: "create-jdesk-app" },
  { id: "options", label: "Scaffolder options" },
  { id: "interactive", label: "The interactive prompt" },
  { id: "jdesk", label: "The jdesk Java CLI" },
  { id: "exit", label: "Exit codes" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="The CLI"
      description="JDesk ships two command-line tools: create-jdesk-app (the npx scaffolder) and jdesk (the Java CLI that generates projects and drives Gradle builds). Both require JDK 25+."
      href={HREF}
      toc={TOC}
    >
      <p>
        <code>create-jdesk-app</code> is a thin, dependency-free Node wrapper
        around the Java generator; <code>jdesk</code> is{" "}
        <code>dev.jdesk.cli.JDeskCli</code>. Node is used only to run the
        scaffolder.
      </p>

      <H2 id="create-jdesk-app">create-jdesk-app</H2>
      <p>Synopsis:</p>
      <CodeBlock
        terminal
        code={`npm create jdesk-app@latest <project-name> [options]
npx create-jdesk-app@latest <project-name> [options]`}
      />
      <p>
        With no project name in a TTY it opens an interactive prompt; when not a
        TTY it prints usage and exits <code>2</code>. It locates a JDK{" "}
        <code>&gt;= 25</code> via <code>JAVA_HOME</code> then <code>PATH</code>;
        older or missing exits <code>1</code>.
      </p>

      <H2 id="options">Scaffolder options</H2>
      <table>
        <thead>
          <tr>
            <th>Option</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>-t, --template &lt;name&gt;</code>
            </td>
            <td>
              <code>basic</code>, <code>structured</code>, <code>vanilla</code>,{" "}
              <code>react</code>, <code>vue</code>, <code>svelte</code> (default{" "}
              <code>basic</code>).
            </td>
          </tr>
          <tr>
            <td>
              <code>-p, --package &lt;id&gt;</code>
            </td>
            <td>reverse-DNS Java package / application id.</td>
          </tr>
          <tr>
            <td>
              <code>--jdesk-version &lt;v&gt;</code>
            </td>
            <td>framework version to depend on.</td>
          </tr>
          <tr>
            <td>
              <code>--jdesk-source &lt;dir&gt;</code>
            </td>
            <td>use a local JDesk checkout as a composite build.</td>
          </tr>
          <tr>
            <td>
              <code>--force</code>
            </td>
            <td>overwrite files in a non-empty directory.</td>
          </tr>
          <tr>
            <td>
              <code>-h, --help</code>
            </td>
            <td>show usage and exit.</td>
          </tr>
        </tbody>
      </table>
      <p>
        An unknown option exits <code>1</code>. Note <code>create-jdesk-app</code>{" "}
        does not expose the <code>maven</code> build system; the underlying{" "}
        <code>jdesk</code> CLI does.
      </p>

      <H2 id="interactive">The interactive prompt</H2>
      <p>
        Run with no project name for a guided setup that asks for: the project
        name (re-prompts if it contains <code>/</code> or <code>\</code>), the
        template (menu 1&ndash;6, default 1 = <code>basic</code>), and the Java
        package (default <code>com.example.&lt;slug&gt;</code>). CLI flags take
        precedence over prompt answers.
      </p>

      <H2 id="jdesk">The jdesk Java CLI</H2>
      <p>
        The bundled Java CLI <code>dev.jdesk.cli.JDeskCli</code> is invoked as a
        module, or via <code>installDist</code> as <code>jdesk &lt;command&gt;</code>.
        Its commands:
      </p>
      <ul>
        <li>
          <code>create &lt;directory&gt;</code> &mdash; generate a project.
          Options: <code>--template</code> (also accepts <code>maven</code>),{" "}
          <code>--package</code> (must match a reverse-DNS pattern),{" "}
          <code>--name</code>, <code>--jdesk-version</code> (default{" "}
          <code>0.1.0-SNAPSHOT</code>), <code>--jdesk-source</code> (must contain{" "}
          <code>settings.gradle.kts</code>), <code>--force</code>.
        </li>
        <li>
          <code>build</code> &mdash; runs <code>./gradlew build</code> (no args).
        </li>
        <li>
          <code>bundle</code> &mdash; runs <code>./gradlew jdeskInstaller</code>{" "}
          (no args).
        </li>
        <li>
          <code>--help</code> / <code>-h</code> / <code>help</code> &mdash; usage.
        </li>
      </ul>
      <p>
        <code>build</code> and <code>bundle</code> need the Gradle wrapper in the
        current directory.
      </p>

      <H2 id="exit">Exit codes</H2>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>0</code>
            </td>
            <td>success</td>
          </tr>
          <tr>
            <td>
              <code>1</code>
            </td>
            <td>
              I/O failure (<code>create-jdesk-app</code> also: JDK missing or
              unknown option)
            </td>
          </tr>
          <tr>
            <td>
              <code>2</code>
            </td>
            <td>usage error</td>
          </tr>
          <tr>
            <td>
              <code>130</code>
            </td>
            <td>interrupted while running Gradle</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="note">
        See <Link href="/docs/installation">Installation</Link> for prerequisites and
        first-run setup.
      </Callout>
    </DocArticle>
  );
}
