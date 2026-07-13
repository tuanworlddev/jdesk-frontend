import type { Lang } from "../lib/highlight";
import { CodeBody, TerminalDots, langLabel } from "./code-body";
import { CopyButton } from "./copy-button";

type Props = {
  code: string;
  lang?: Lang;
  /** Filename shown in the panel header, angular.dev style. */
  filename?: string;
  /** Render as a terminal: a leading prompt glyph and window dots. */
  terminal?: boolean;
  className?: string;
};

export function CodeBlock({
  code,
  lang = "text",
  filename,
  terminal = false,
  className = "",
}: Props) {
  const source = code.replace(/\n$/, "");

  return (
    <div
      className={`group not-prose overflow-hidden rounded-xl border border-line bg-surface ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {terminal ? (
            <TerminalDots />
          ) : (
            <span className="truncate font-mono text-xs text-fg-muted">
              {filename ?? langLabel(lang)}
            </span>
          )}
          {terminal && filename && (
            <span className="truncate font-mono text-xs text-fg-faint">
              {filename}
            </span>
          )}
        </div>
        <CopyButton text={source} />
      </div>
      <CodeBody code={source} lang={lang} terminal={terminal} />
    </div>
  );
}
