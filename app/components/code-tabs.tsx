"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../lib/highlight";
import { CodeBody, TerminalDots } from "./code-body";
import { CopyButton } from "./copy-button";

export type CodeTab = {
  /** Tab label, e.g. "macOS / Linux" or "Windows". */
  label: string;
  code: string;
  lang?: Lang;
  terminal?: boolean;
  /** Match against the visitor's OS to auto-select, e.g. "windows" | "mac". */
  os?: "windows" | "mac" | "linux";
};

/**
 * A code panel with tabs — used for commands that differ per operating system.
 * On mount it selects the tab matching the visitor's OS when one is provided,
 * so a Windows user lands on the Windows commands automatically.
 */
export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const detected: CodeTab["os"] | null = ua.includes("win")
      ? "windows"
      : ua.includes("mac")
        ? "mac"
        : ua.includes("linux")
          ? "linux"
          : null;
    if (!detected) return;
    const idx = tabs.findIndex((t) => t.os === detected);
    if (idx >= 0) setActive(idx);
  }, [tabs]);

  const current = tabs[active] ?? tabs[0];

  return (
    <div className="group not-prose overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 pr-4">
        <div className="flex min-w-0 items-center">
          {current.terminal && (
            <span className="pl-4 pr-1">
              <TerminalDots />
            </span>
          )}
          <div role="tablist" className="flex min-w-0 overflow-x-auto">
            {tabs.map((tab, i) => {
              const selected = i === active;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(i)}
                  className={`relative whitespace-nowrap px-3.5 py-2.5 font-mono text-xs transition-colors ${
                    selected
                      ? "text-fg"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {tab.label}
                  {selected && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-ember to-arc" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <CopyButton text={current.code.replace(/\n$/, "")} />
      </div>
      <CodeBody
        code={current.code}
        lang={current.lang}
        terminal={current.terminal}
      />
    </div>
  );
}
