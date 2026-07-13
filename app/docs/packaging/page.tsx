import type { Metadata } from "next";
import { Callout } from "../../components/callout";
import { CodeTabs } from "../../components/code-tabs";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Packaging your app",
  description:
    "Turn your JDesk project into a self-contained application image and native installer with jlink + jpackage.",
};

const HREF = "/docs/packaging";
const TOC = [
  { id: "target", label: "Build on the target OS" },
  { id: "frontend", label: "1. Build the frontend" },
  { id: "runtime", label: "2. Build the runtime image" },
  { id: "image", label: "3. Build the application image" },
  { id: "installer", label: "4. Create an installer" },
  { id: "verify", label: "5. Verify the evidence" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="Packaging your app"
      description="Turn your JDesk project into a self-contained application image that runs without Gradle or a globally installed JRE — from frontend build to runtime image to native installer."
      href={HREF}
      toc={TOC}
    >
      <p>
        This walks the packaging tasks in order. Verify the toolchain first with{" "}
        <code>jdeskDoctor</code>.
      </p>

      <H2 id="target">Build on the target OS</H2>
      <Callout variant="warning">
        <code>jpackage</code> cannot cross-produce another OS&rsquo;s package —
        build each package on its own operating system.
      </Callout>

      <H2 id="frontend">1. Build the frontend</H2>
      <p>Build the frontend.</p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew jdeskFrontendBuild`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat jdeskFrontendBuild`,
          },
        ]}
      />
      <p>
        It runs the frontend <code>buildCommand</code>, writes to{" "}
        <code>distDirectory</code> (<code>ui/dist</code>), and{" "}
        <code>processResources</code> packs it into the jar under{" "}
        <code>/web</code>. With no frontend the task skips with{" "}
        <code>NO-SOURCE</code>.
      </p>

      <H2 id="runtime">2. Build the runtime image</H2>
      <p>Build the trimmed runtime image.</p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew jdeskRuntimeImage`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat jdeskRuntimeImage`,
          },
        ]}
      />
      <p>
        It runs <code>jdeps</code> to compute required modules, then{" "}
        <code>jlink</code> into <code>build/jdesk/runtime-image</code>. No global
        native-access privilege is baked in; add modules with{" "}
        <code>additionalModules</code> if needed.
      </p>

      <H2 id="image">3. Build the application image</H2>
      <p>Build the platform application image.</p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew jdeskPackage`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat jdeskPackage`,
          },
        ]}
      />
      <p>
        It stages the named modules, runs <code>jpackage</code>, and writes to{" "}
        <code>build/jdesk/package</code>. macOS adds{" "}
        <code>--mac-package-identifier &lt;applicationId&gt;</code> and{" "}
        <code>-XstartOnFirstThread</code>. The two launch modes:
      </p>
      <ul>
        <li>
          <strong>Classpath app</strong> (the default single-module case, no{" "}
          <code>module-info.java</code>) — launched from <code>--input</code>{" "}
          jars with <code>--main-jar</code>/<code>--main-class</code>, native
          access <code>--enable-native-access=ALL-UNNAMED</code>, assets from the
          classpath.
        </li>
        <li>
          <strong>Modular app</strong> (set <code>jdesk.mainModule</code> and
          ship <code>module-info.java</code>) — launched from the module path
          with <code>--enable-native-access</code> scoped to{" "}
          <code>dev.jdesk.platform.&lt;os&gt;</code> and{" "}
          <code>--illegal-native-access=deny</code>.
        </li>
      </ul>
      <p>
        The task also writes <code>checksums.sha256</code> (sorted, GNU coreutils
        format) and <code>sbom.cyclonedx.json</code> (CycloneDX 1.7), logging that
        the artifacts are <code>UNSIGNED</code>.
      </p>

      <H2 id="installer">4. Create an installer</H2>
      <p>Create a native installer on the current OS.</p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew jdeskInstaller`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat jdeskInstaller`,
          },
        ]}
      />
      <p>
        It supports DMG/PKG on macOS, MSI/EXE on Windows, and DEB/RPM on Linux.
      </p>
      <Callout variant="status" title="Signing">
        <code>jdeskPackage</code> is implemented and verified on all three
        targets. <code>jdeskInstaller</code> builds a real but{" "}
        <code>UNSIGNED</code> installer without a signing identity; OS signing and
        notarization require publisher credentials.
      </Callout>

      <H2 id="verify">5. Verify the evidence</H2>
      <p>Verify the generated evidence.</p>
      <CodeTabs
        tabs={[
          {
            label: "macOS / Linux",
            os: "mac",
            terminal: true,
            code: `./gradlew jdeskVerifyEvidence`,
          },
          {
            label: "Windows",
            os: "windows",
            terminal: true,
            code: `.\\gradlew.bat jdeskVerifyEvidence`,
          },
        ]}
      />
      <p>
        It recomputes checksums, validates schemas, and rejects fake providers
        against the evidence directory (default <code>build/evidence</code>).
        There is also <code>jdeskNativeSmokeTest</code>, which depends on{" "}
        <code>jdeskPackage</code> and launches the real packaged launcher with{" "}
        <code>--jdesk-smoke</code>, requiring exit 0 within a timeout (default
        180&nbsp;s) — your app must implement <code>--jdesk-smoke</code> as a
        genuine self-check.
      </p>
    </DocArticle>
  );
}
