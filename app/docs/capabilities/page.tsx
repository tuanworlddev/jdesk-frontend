import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "../../components/code-block";
import { Callout } from "../../components/callout";
import { DocArticle } from "../_components/doc-article";
import { H2 } from "../_components/prose";

export const metadata: Metadata = {
  title: "Capabilities & permissions",
  description:
    "Commands are deny-by-default. Declare capabilities on commands and grant them to windows.",
};

const HREF = "/docs/capabilities";
const TOC = [
  { id: "require", label: "Require a capability" },
  { id: "grant", label: "Grant it in jdesk-capabilities.json" },
  { id: "load", label: "Load the capability set" },
  { id: "denial", label: "What happens on denial" },
  { id: "minimum", label: "Grant the minimum" },
];

export default function Page() {
  return (
    <DocArticle
      eyebrow="Guides"
      title="Capabilities & permissions"
      description="Commands are deny-by-default: a window can invoke a command only if it holds the required capability. Declare capabilities on commands and grant them to windows in jdesk-capabilities.json."
      href={HREF}
      toc={TOC}
    >
      <p>
        JDesk is deny-by-default — a window can invoke a command only if it holds
        the required capability.
      </p>

      <H2 id="require">Require a capability</H2>
      <p>
        Declare with <code>@RequiresCapability(&quot;area:action&quot;)</code>{" "}
        (1..128 chars, non-blank). Safe commands opt out with{" "}
        <code>@PublicDesktopCommand</code>. Declaring neither annotation is a
        compile-time error; the two are mutually exclusive.
      </p>
      <CodeBlock
        lang="java"
        filename="ClipboardService.java"
        code={`@DesktopCommand("clipboard.read")
@RequiresCapability("clipboard:read")
public CompletionStage<Clip> read(InvocationContext context) {
    return CompletableFuture.completedFuture(readClipboard());
}`}
      />

      <H2 id="grant">Grant it in jdesk-capabilities.json</H2>
      <p>
        Place <code>jdesk-capabilities.json</code> on the application
        module&rsquo;s resources. <code>version</code> must be <code>1</code>.
        Each <code>grants</code> entry has a <code>capability</code> string and an
        optional <code>windows</code> array of window ids. Omit{" "}
        <code>windows</code> to grant to every window. Validation is strict: an
        unknown field, wrong version, or malformed JSON fails application startup.
      </p>
      <CodeBlock
        lang="json"
        filename="jdesk-capabilities.json"
        code={`{
  "version": 1,
  "grants": [
    { "capability": "greeting:use", "windows": ["main"] },
    { "capability": "clipboard:read" }
  ]
}`}
      />

      <H2 id="load">Load the capability set</H2>
      <p>Pass the parsed set via the builder.</p>
      <CodeBlock
        lang="java"
        code={`.capabilities(Capabilities.fromResource(
        Main.class.getModule(), "jdesk-capabilities.json"))`}
      />
      <p>
        No <code>.capabilities(...)</code> call means an empty set — every gated
        command is denied.
      </p>

      <H2 id="denial">What happens on denial</H2>
      <p>
        On denial the runtime returns <code>CAPABILITY_DENIED</code>. The check
        runs before payload deserialization and before the handler runs. The
        frontend rejects with a <code>JDeskError</code> whose message is a safe,
        generic string (&quot;Command is not allowed for this window&quot;).
      </p>

      <H2 id="minimum">Grant the minimum</H2>
      <p>
        The capability gate is the enforced security boundary, per-window (not
        per-frame). Grant each window only what it needs; ship no dangerous
        capabilities by default. Because XSS in a page is a capability-scoped
        compromise, keeping the granted set small limits the blast radius.
      </p>
      <Callout variant="note">
        See the <Link href="/docs/security-model">Security model</Link> for how the
        capability gate fits the wider threat model.
      </Callout>
    </DocArticle>
  );
}
