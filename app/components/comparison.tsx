const ROWS: { label: string; jdesk: string; tauri: string; electron: string }[] =
  [
    { label: "Backend language", jdesk: "Java (JVM)", tauri: "Rust", electron: "Node.js" },
    {
      label: "Renderer",
      jdesk: "System WebView",
      tauri: "System WebView",
      electron: "Bundled Chromium",
    },
    {
      label: "Bundle size",
      jdesk: "Small (jlink runtime)",
      tauri: "Smallest",
      electron: "Large (100+ MB)",
    },
    {
      label: "Runtime dependency",
      jdesk: "Trimmed JVM (bundled)",
      tauri: "None",
      electron: "Bundled Chromium",
    },
    {
      label: "IPC",
      jdesk: "Compile-time typed",
      tauri: "Typed commands",
      electron: "IPC channels",
    },
    {
      label: "Best fit",
      jdesk: "Java / JVM teams",
      tauri: "Rust / native teams",
      electron: "Max web-parity",
    },
  ];

export function Comparison() {
  return (
    <div className="not-prose w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-line bg-surface [contain:inline-size]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">
            Comparison of JDesk, Tauri, and Electron
          </caption>
          <thead>
            <tr className="border-b border-line-strong">
              <th className="px-5 py-4 text-left font-medium text-fg-faint" />
              <th className="px-5 py-4 text-left">
                <span className="font-display text-base font-semibold bridge-text">
                  JDesk
                </span>
              </th>
              <th className="px-5 py-4 text-left font-display text-base font-semibold text-fg-muted">
                Tauri
              </th>
              <th className="px-5 py-4 text-left font-display text-base font-semibold text-fg-muted">
                Electron
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.label}
                className={i < ROWS.length - 1 ? "border-b border-line" : ""}
              >
                <th scope="row" className="px-5 py-3.5 text-left font-medium text-fg-muted">
                  {row.label}
                </th>
                <td className="px-5 py-3.5">
                  <span className="rounded-md bg-arc-soft px-2 py-1 font-medium text-fg">
                    {row.jdesk}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-fg-muted">{row.tauri}</td>
                <td className="px-5 py-3.5 text-fg-muted">{row.electron}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
