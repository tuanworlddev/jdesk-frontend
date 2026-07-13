import { BridgeHero } from "./components/bridge-hero";
import { CodeBlock } from "./components/code-block";
import { Comparison } from "./components/comparison";
import {
  ArrowLink,
  Eyebrow,
  GhostButton,
  PrimaryButton,
  SectionEyebrow,
} from "./components/ui";
import { fetchSiteContent } from "./lib/site-content";

function PillarIcon({ name }: { name: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "browser":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2.5" {...p} />
          <path d="M3 8h18" {...p} />
          <circle cx="6" cy="6" r="0.6" fill="currentColor" />
          <circle cx="8" cy="6" r="0.6" fill="currentColor" />
        </svg>
      );
    case "cube":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" {...p} />
          <path d="M12 3v18M4 7.5l8 4.5 8-4.5" {...p} />
        </svg>
      );
    case "bolt":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" {...p} />
        </svg>
      );
    case "code":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16" {...p} />
        </svg>
      );
    case "shield":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" {...p} />
          <path d="M9 12l2 2 4-4" {...p} />
        </svg>
      );
    case "package":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" {...p} />
          <path d="M4 7.5l8 4.5 8-4.5M12 12v9" {...p} />
          <path d="M8 5.2l8 4.6" {...p} />
        </svg>
      );
    default:
      return <span className="h-2.5 w-2.5 rounded-sm bg-current" />;
  }
}

export default async function Home() {
  const { home } = await fetchSiteContent();
  const { hero, why, pillars, platforms, roundTrip, comparison, cta } = home;

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 signal-field opacity-70" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-ember/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 left-0 h-[380px] w-[380px] rounded-full bg-arc/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Eyebrow>{hero.eyebrow}</Eyebrow>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl lg:text-6xl">
                Desktop apps with a{" "}
                <span className="bridge-text">{hero.titleA}</span> and a{" "}
                <span className="bridge-text">{hero.titleB}</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
                {hero.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PrimaryButton href={hero.ctaPrimary.href}>
                  {hero.ctaPrimary.label}
                </PrimaryButton>
                <GhostButton href={hero.ctaSecondary.href}>
                  {hero.ctaSecondary.label}
                </GhostButton>
              </div>

              <div className="mt-8 max-w-md">
                <CodeBlock code={hero.command} terminal />
                <p className="mt-2.5 font-mono text-xs text-fg-faint">
                  Requires JDK&nbsp;25+ and your platform&rsquo;s system WebView.
                </p>
              </div>
            </div>

            <div className="lg:pl-4">
              <BridgeHero />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Why JDesk */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <SectionEyebrow>{why.eyebrow}</SectionEyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-4xl">
            {why.title}
          </h2>
          <p className="mt-4 text-lg text-fg-muted">{why.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="card p-6">
              <div
                className={`mb-4 grid h-10 w-10 place-items-center rounded-lg border ${
                  pillar.tone === "ember"
                    ? "border-ember/30 bg-ember-soft text-ember"
                    : "border-arc/30 bg-arc-soft text-arc-strong"
                }`}
              >
                <PillarIcon name={pillar.icon} />
              </div>
              <h3 className="font-display text-lg font-semibold text-fg">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Round trip code */}
      <section className="border-y border-line bg-bg-tint">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid min-w-0 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="min-w-0">
              <SectionEyebrow tone="ember">{roundTrip.eyebrow}</SectionEyebrow>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-4xl">
                {roundTrip.title}
              </h2>
              <p className="mt-4 text-lg text-fg-muted">{roundTrip.intro}</p>
              <ul className="mt-6 space-y-3">
                {roundTrip.bullets.map((t) => (
                  <li key={t} className="flex gap-3 text-sm text-fg-muted">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 shrink-0"
                    >
                      <circle cx="12" cy="12" r="9" stroke="var(--arc)" strokeWidth="1.6" />
                      <path
                        d="M8 12l2.5 2.5L16 9"
                        stroke="var(--arc)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <ArrowLink href={roundTrip.link.href}>
                  {roundTrip.link.label}
                </ArrowLink>
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              <CodeBlock
                code={roundTrip.javaCode}
                lang="java"
                filename={roundTrip.javaFilename}
              />
              <CodeBlock
                code={roundTrip.tsCode}
                lang="ts"
                filename={roundTrip.tsFilename}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Comparison */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <SectionEyebrow>{comparison.eyebrow}</SectionEyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-4xl">
            {comparison.title}
          </h2>
          <p className="mt-4 text-lg text-fg-muted">{comparison.intro}</p>
        </div>
        <div className="mt-10">
          <Comparison rows={comparison.rows} />
        </div>
      </section>

      {/* --------------------------------------------------- Platforms */}
      <section className="border-t border-line bg-bg-tint">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <SectionEyebrow tone="ember">Platform support</SectionEyebrow>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-4xl">
                Verified on real system WebViews.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-fg-muted">
              Native, packaging, security, and stress tests run on real CI
              runners and Apple Silicon hardware for every target.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {platforms.map((platform) => (
              <div key={platform.os} className="card p-6">
                <div className="font-display text-xl font-semibold text-fg">
                  {platform.os}
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-fg-faint">WebView</dt>
                    <dd className="text-right font-mono text-fg-muted">
                      {platform.webview}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                    <dt className="text-fg-faint">Minimum</dt>
                    <dd className="text-right font-mono text-fg-muted">
                      {platform.target}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Final CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 signal-field opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-5xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted">
            {cta.subtitle}
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <CodeBlock code={cta.command} terminal />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PrimaryButton href={cta.ctaPrimary.href}>
              {cta.ctaPrimary.label}
            </PrimaryButton>
            <GhostButton href={cta.ctaSecondary.href}>
              {cta.ctaSecondary.label}
            </GhostButton>
          </div>
        </div>
      </section>
    </>
  );
}
