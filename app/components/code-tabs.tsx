"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
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

function detectedOperatingSystem(): CodeTab["os"] | null {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("win")
    ? "windows"
    : ua.includes("mac")
      ? "mac"
      : ua.includes("linux")
        ? "linux"
        : null;
}

const subscribeToStaticBrowserValue = () => () => {};

/**
 * A code panel with tabs — used for commands that differ per operating system.
 * On mount it selects the tab matching the visitor's OS when one is provided,
 * so a Windows user lands on the Windows commands automatically.
 */
export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const detected = useSyncExternalStore(
    subscribeToStaticBrowserValue,
    detectedOperatingSystem,
    () => null,
  );
  const detectedIndex = detected ? tabs.findIndex((tab) => tab.os === detected) : -1;
  const active = selected ?? (detectedIndex >= 0 ? detectedIndex : 0);

  const current = tabs[active] ?? tabs[0];

  const selectAndFocus = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectAndFocus(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectAndFocus(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectAndFocus(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectAndFocus(tabs.length - 1);
    }
  };

  return (
    <div className="group not-prose min-w-0 max-w-full overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 pr-4">
        <div className="flex min-w-0 items-center">
          {current.terminal && (
            <span className="pl-4 pr-1">
              <TerminalDots />
            </span>
          )}
          <div
            role="tablist"
            aria-label="Platform-specific commands"
            className="flex min-w-0 overflow-x-auto"
          >
            {tabs.map((tab, i) => {
              const selected = i === active;
              return (
                <button
                  ref={(element) => {
                    tabRefs.current[i] = element;
                  }}
                  key={tab.label}
                  id={`${baseId}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${i}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setSelected(i)}
                  onKeyDown={(event) => onTabKeyDown(event, i)}
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
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          id={`${baseId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${i}`}
          tabIndex={0}
          hidden={i !== active}
        >
          <CodeBody
            code={tab.code}
            lang={tab.lang}
            terminal={tab.terminal}
          />
        </div>
      ))}
    </div>
  );
}
