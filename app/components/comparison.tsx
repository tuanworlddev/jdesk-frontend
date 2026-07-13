import type { ComparisonRow } from "../lib/site-content";

export function Comparison({ rows }: { rows: ComparisonRow[] }) {
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
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={i < rows.length - 1 ? "border-b border-line" : ""}
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
