"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The signature illustration: one round trip across the JDesk bridge.
 * A web frontend invokes a command; a Java handler runs on a virtual thread
 * and a result crosses back. Warm ember = the Java core, cool arc = the web
 * frontend — the gradient between them is the bridge itself.
 *
 * Drawn as a single SVG so every part scales together. Packet motion uses SMIL
 * <animateMotion>, rendered only when the visitor has not asked to reduce
 * motion.
 */
export function BridgeHero() {
  const [step, setStep] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    reducedMotionSnapshot,
    () => true,
  );
  const animate = !reduceMotion;

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1200);
    return () => clearInterval(id);
  }, [animate]);

  const STAGES = ["nonce", "hello", "invoke", "result"] as const;

  return (
    <div className="not-prose relative overflow-hidden rounded-2xl border border-line bg-surface/70">
      <div className="pointer-events-none absolute inset-0 signal-field opacity-60" />
      <div className="relative p-4 sm:p-6">
        <svg
          viewBox="0 0 760 360"
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          style={{ aspectRatio: "760 / 360" }}
          role="img"
          aria-label="A web frontend invokes the greeting.greet command; a Java handler returns a typed result across the bridge."
        >
          <defs>
            <linearGradient id="bh-arc" x1="274" y1="120" x2="486" y2="120">
              <stop offset="0" stopColor="var(--arc)" />
              <stop offset="1" stopColor="var(--ember)" />
            </linearGradient>
            <linearGradient id="bh-arc2" x1="486" y1="250" x2="274" y2="250">
              <stop offset="0" stopColor="var(--ember)" />
              <stop offset="1" stopColor="var(--arc)" />
            </linearGradient>
            <filter id="bh-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ---- connecting arcs ---- */}
          <path
            id="bh-invoke-path"
            d="M270 138 C 350 96, 410 96, 490 138"
            fill="none"
            stroke="url(#bh-arc)"
            strokeWidth="1.6"
            strokeDasharray="4 5"
            opacity="0.7"
          />
          <path
            id="bh-result-path"
            d="M490 232 C 410 274, 350 274, 270 232"
            fill="none"
            stroke="url(#bh-arc2)"
            strokeWidth="1.6"
            strokeDasharray="4 5"
            opacity="0.7"
          />

          {/* arc labels */}
          <text x="380" y="86" textAnchor="middle" className="fill-[var(--fg-faint)]" fontSize="11" fontFamily="var(--font-mono)">
            invoke
          </text>
          <text x="380" y="292" textAnchor="middle" className="fill-[var(--fg-faint)]" fontSize="11" fontFamily="var(--font-mono)">
            result
          </text>

          {/* ---- Frontend card (cool / arc) ---- */}
          <g>
            <rect x="24" y="58" width="248" height="244" rx="16" fill="var(--surface-2)" stroke="var(--line)" />
            <rect x="24" y="58" width="248" height="34" rx="16" fill="var(--arc-soft)" />
            <rect x="24" y="80" width="248" height="12" fill="var(--arc-soft)" />
            <circle cx="44" cy="75" r="4" fill="var(--arc)" />
            <text x="60" y="79" fontSize="12.5" fontFamily="var(--font-mono)" className="fill-[var(--arc-strong)]" fontWeight="600">
              Web frontend
            </text>
            <text x="44" y="128" fontSize="11" fontFamily="var(--font-sans)" className="fill-[var(--fg-faint)]">
              index.html · WebView
            </text>
            {/* input */}
            <rect x="44" y="142" width="208" height="34" rx="8" fill="var(--surface)" stroke="var(--line-strong)" />
            <text x="58" y="163" fontSize="13" fontFamily="var(--font-sans)" className="fill-[var(--fg)]">
              JDesk
            </text>
            {/* button */}
            <rect x="44" y="188" width="96" height="34" rx="8" fill="var(--fg)" />
            <text x="92" y="209" textAnchor="middle" fontSize="12.5" fontFamily="var(--font-sans)" fontWeight="600" className="fill-[var(--bg)]">
              Greet
            </text>
            {/* result line */}
            <text x="44" y="252" fontSize="12.5" fontFamily="var(--font-mono)" className="fill-[var(--fg-muted)]">
              → Hello, JDesk!
            </text>
            <text x="44" y="278" fontSize="11" fontFamily="var(--font-mono)" className="fill-[var(--arc-strong)]">
              window: main
            </text>
          </g>

          {/* ---- Java card (warm / ember) ---- */}
          <g>
            <rect x="488" y="58" width="248" height="244" rx="16" fill="var(--surface-2)" stroke="var(--line)" />
            <rect x="488" y="58" width="248" height="34" rx="16" fill="var(--ember-soft)" />
            <rect x="488" y="80" width="248" height="12" fill="var(--ember-soft)" />
            <circle cx="508" cy="75" r="4" fill="var(--ember)" />
            <text x="524" y="79" fontSize="12.5" fontFamily="var(--font-mono)" className="fill-[var(--ember)]" fontWeight="600">
              Java core
            </text>
            <text x="508" y="124" fontSize="11.5" fontFamily="var(--font-mono)" className="fill-[var(--arc)]">
              @DesktopCommand
            </text>
            <text x="508" y="146" fontSize="11.5" fontFamily="var(--font-mono)" className="fill-[var(--fg-muted)]">
              greet(req, ctx) {"{"}
            </text>
            <text x="524" y="168" fontSize="11.5" fontFamily="var(--font-mono)" className="fill-[var(--fg)]">
              var name =
            </text>
            <text x="524" y="188" fontSize="11.5" fontFamily="var(--font-mono)" className="fill-[var(--fg)]">
              req.name();
            </text>
            <text x="524" y="210" fontSize="11.5" fontFamily="var(--font-mono)" className="fill-[var(--fg-muted)]">
              return &quot;Hello, &quot;
            </text>
            <text x="508" y="232" fontSize="11.5" fontFamily="var(--font-mono)" className="fill-[var(--fg-muted)]">
              {"}"}
            </text>
            <text x="508" y="270" fontSize="10.5" fontFamily="var(--font-mono)" className="fill-[var(--ember)]">
              ⟳ virtual thread
            </text>
          </g>

          {/* ---- packets ---- */}
          {animate && (
            <>
              <g filter="url(#bh-glow)">
                <circle r="5" fill="var(--arc)">
                  <animateMotion dur="2.4s" begin="0s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.5 0 0.5 1">
                    <mpath href="#bh-invoke-path" />
                  </animateMotion>
                  <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0;1;1;0.2" keyTimes="0;0.15;0.85;1" />
                </circle>
              </g>
              <g filter="url(#bh-glow)">
                <circle r="5" fill="var(--ember)">
                  <animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.5 0 0.5 1">
                    <mpath href="#bh-result-path" />
                  </animateMotion>
                  <animate attributeName="opacity" dur="2.4s" begin="1.2s" repeatCount="indefinite" values="0;1;1;0.2" keyTimes="0;0.15;0.85;1" />
                </circle>
              </g>
            </>
          )}

          {/* static endpoints */}
          <circle cx="270" cy="138" r="4.5" fill="var(--arc)" />
          <circle cx="490" cy="138" r="4.5" fill="var(--ember)" />
          <circle cx="490" cy="232" r="4.5" fill="var(--ember)" />
          <circle cx="270" cy="232" r="4.5" fill="var(--arc)" />
        </svg>

        {/* the wire log — teaches the handshake sequence */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-[0.7rem]">
          {STAGES.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors duration-500 ${
                  animate && step === i
                    ? "border-arc/50 bg-arc-soft text-arc-strong"
                    : "border-line bg-surface-2 text-fg-faint"
                }`}
              >
                {s}
              </span>
              {i < STAGES.length - 1 && (
                <span className="text-fg-faint">→</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
