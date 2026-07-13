import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jdesk.dev"),
  title: {
    default: "JDesk — Desktop apps with a Java core and a web UI",
    template: "%s · JDesk",
  },
  description:
    "JDesk is a desktop application framework: a Java 25 core, a web frontend, and the operating system's own WebView. The Tauri model, without Rust.",
  openGraph: {
    title: "JDesk",
    description:
      "Build small, native desktop apps with a Java 25 core and a web UI. No bundled Chromium, no Rust, no Node at runtime.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
