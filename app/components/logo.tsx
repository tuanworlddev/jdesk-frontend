export function LogoMark({ size = 26 }: { size?: number }) {
  const id = "jdesk-mark";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-arc`} x1="4" y1="26" x2="28" y2="6">
          <stop offset="0" stopColor="var(--ember)" />
          <stop offset="1" stopColor="var(--arc)" />
        </linearGradient>
      </defs>
      {/* native window frame */}
      <rect
        x="3.25"
        y="3.25"
        width="25.5"
        height="25.5"
        rx="7"
        stroke="var(--line-strong)"
        strokeWidth="1.5"
      />
      {/* title-bar dots */}
      <circle cx="8.5" cy="8.5" r="1.35" fill="var(--ember)" />
      <circle cx="12.7" cy="8.5" r="1.35" fill="var(--fg-faint)" />
      {/* the bridge: an arc crossing warm to cool */}
      <path
        d="M7 24C7 15.5 13 10.5 25 9"
        stroke={`url(#${id}-arc)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="7" cy="24" r="2.4" fill="var(--ember)" />
      <circle cx="25" cy="9" r="2.4" fill="var(--arc)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-[1.15rem] font-600 tracking-tight text-fg ${className}`}
      style={{ fontWeight: 600 }}
    >
      JDesk
    </span>
  );
}
