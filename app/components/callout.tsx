import type { ReactNode } from "react";

type Variant = "note" | "warning" | "status" | "tip";

const STYLES: Record<
  Variant,
  { border: string; label: string; labelColor: string; icon: ReactNode }
> = {
  note: {
    border: "var(--arc)",
    label: "Note",
    labelColor: "text-arc-strong",
    icon: <InfoIcon />,
  },
  tip: {
    border: "var(--arc)",
    label: "Tip",
    labelColor: "text-arc-strong",
    icon: <BulbIcon />,
  },
  warning: {
    border: "var(--ember)",
    label: "Careful",
    labelColor: "text-ember",
    icon: <WarnIcon />,
  },
  status: {
    border: "var(--ember)",
    label: "Project status",
    labelColor: "text-ember",
    icon: <FlagIcon />,
  },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const s = STYLES[variant];
  return (
    <div
      className="not-prose my-6 rounded-xl border border-line bg-surface-2/60 p-4 pl-5"
      style={{ borderLeft: `2.5px solid ${s.border}` }}
    >
      <div className={`flex items-center gap-2 text-sm font-semibold ${s.labelColor}`}>
        {s.icon}
        {title ?? s.label}
      </div>
      <div className="mt-1.5 text-sm leading-relaxed text-fg-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-arc [&_a:hover]:text-arc-strong [&_code]:rounded [&_code]:border [&_code]:border-line [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.82em]">
        {children}
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.7" r="1.1" fill="currentColor" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 2.5 20h19L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 21V4m0 1 4-1c2 .5 4 .5 6-.5s4-1 5-.5v9c-1 .5-3 .5-5 .5s-4-1-6-.5l-4 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
