import { highlight, type Lang } from "../lib/highlight";

/**
 * The scrollable code area shared by CodeBlock and CodeTabs — the highlighted
 * (or terminal-prompted) source, without the surrounding panel chrome. Plain
 * function with no server-only APIs, so it renders in either a server or a
 * client parent.
 */
export function CodeBody({
  code,
  lang = "text",
  terminal = false,
}: {
  code: string;
  lang?: Lang;
  terminal?: boolean;
}) {
  const source = code.replace(/\n$/, "");
  const effectiveLang: Lang = terminal ? "bash" : lang;
  return (
    <div className="overflow-x-auto">
      <pre className="px-4 py-4 text-[0.83rem] leading-[1.7]">
        <code className="font-mono text-fg">
          {terminal ? renderTerminal(source) : highlight(source, effectiveLang)}
        </code>
      </pre>
    </div>
  );
}

function renderTerminal(source: string) {
  const lines = source.split("\n");
  return lines.map((line, idx) => {
    const isComment = line.trimStart().startsWith("#");
    const showPrompt = line.trim().length > 0 && !isComment;
    return (
      <span key={idx} className="block">
        {showPrompt && <span className="select-none text-arc">$ </span>}
        {isComment ? (
          <span className="tok-comment">{line}</span>
        ) : (
          highlight(line, "bash")
        )}
        {idx < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

export function langLabel(lang: Lang): string {
  const map: Record<Lang, string> = {
    java: "Java",
    kotlin: "build.gradle.kts",
    ts: "TypeScript",
    js: "JavaScript",
    json: "JSON",
    bash: "Terminal",
    text: "",
  };
  return map[lang] ?? "";
}

export function TerminalDots() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full bg-ember/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-fg-faint/40" />
      <span className="h-2.5 w-2.5 rounded-full bg-arc/70" />
    </span>
  );
}
