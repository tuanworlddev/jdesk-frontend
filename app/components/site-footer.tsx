import Link from "next/link";
import { LogoMark } from "./logo";
import { FeedbackLink } from "./feedback-link";
import type { FooterContent, GeneralContent } from "../lib/site-content";

export function SiteFooter({
  footer,
  general,
}: {
  footer: FooterContent;
  general: GeneralContent;
}) {
  return (
    <footer className="border-t border-line bg-bg-tint">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-lg font-semibold text-fg">
                {general.siteName}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
              {footer.tagline}
            </p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-faint">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-faint">{footer.legal}</p>
          <div className="flex items-center gap-5 text-xs text-fg-muted">
            <FeedbackLink />
            <a
              href={general.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-fg"
            >
              GitHub
            </a>
            <a
              href={general.npmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-fg"
            >
              npm
            </a>
            <Link href="/docs" className="transition-colors hover:text-fg">
              Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
