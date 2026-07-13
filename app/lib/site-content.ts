// Server-side access to the interface content managed in the CMS. Fetches the
// whole /site-content map, merged over local defaults so the site still renders
// if the API is unavailable or a key is missing.

export type Link = { label: string; href: string };

export type GeneralContent = {
  siteName: string;
  tagline: string;
  githubUrl: string;
  npmUrl: string;
};

export type NavContent = {
  items: Link[];
  cta: Link;
};

export type Pillar = { icon: string; tone: "ember" | "arc"; title: string; body: string };
export type Platform = { os: string; webview: string; target: string };

export type RoundTrip = {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
  link: Link;
  javaFilename: string;
  javaCode: string;
  tsFilename: string;
  tsCode: string;
};

export type ComparisonRow = {
  label: string;
  jdesk: string;
  tauri: string;
  electron: string;
};

export type ComparisonContent = {
  eyebrow: string;
  title: string;
  intro: string;
  rows: ComparisonRow[];
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    ctaPrimary: Link;
    ctaSecondary: Link;
    command: string;
  };
  why: { eyebrow: string; title: string; subtitle: string };
  pillars: Pillar[];
  platforms: Platform[];
  roundTrip: RoundTrip;
  comparison: ComparisonContent;
  cta: {
    title: string;
    subtitle: string;
    command: string;
    ctaPrimary: Link;
    ctaSecondary: Link;
  };
};

export type FooterContent = {
  tagline: string;
  columns: { title: string; links: Link[] }[];
  legal: string;
};

export type SiteContent = {
  general: GeneralContent;
  nav: NavContent;
  home: HomeContent;
  footer: FooterContent;
};

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

export const DEFAULT_CONTENT: SiteContent = {
  general: {
    siteName: "JDesk",
    tagline: "Desktop apps with a Java core and a web UI.",
    githubUrl: "https://github.com/tuanworlddev/jdesk",
    npmUrl: "https://www.npmjs.com/package/create-jdesk-app",
  },
  nav: {
    items: [
      { label: "Docs", href: "/docs" },
      { label: "Install", href: "/docs/installation" },
      { label: "Guides", href: "/docs/defining-commands" },
      { label: "Concepts", href: "/docs/architecture" },
    ],
    cta: { label: "Get started", href: "/docs/your-first-app" },
  },
  home: {
    hero: {
      eyebrow: "Java 25 core · System WebView · Open source",
      titleA: "Java core",
      titleB: "web UI",
      subtitle:
        "JDesk pairs a Java 25 application core with the operating system's own WebView — WebView2, WKWebView, WebKitGTK. The Tauri development model, without Rust, without bundled Chromium.",
      ctaPrimary: { label: "Build your first app", href: "/docs/your-first-app" },
      ctaSecondary: { label: "Read the introduction", href: "/docs/introduction" },
      command: "npm create jdesk-app@latest my-app",
    },
    why: {
      eyebrow: "Why JDesk",
      title: "The small-native trade-off, made for Java teams.",
      subtitle:
        "Keep business logic, system integration, lifecycle, and packaging in Java. Build the UI with React, Vue, Svelte, or plain HTML. Ship a small native app.",
    },
    pillars: [],
    platforms: [
      { os: "Windows", webview: "WebView2 (Evergreen)", target: "Windows 10 1809+" },
      { os: "macOS", webview: "WKWebView", target: "macOS 13 Ventura+" },
      { os: "Linux", webview: "WebKitGTK 4.1", target: "Ubuntu 22.04+" },
    ],
    roundTrip: {
      eyebrow: "One round trip",
      title: "Call Java from the web. Get a typed record back.",
      intro:
        "Annotate a method with @DesktopCommand and JDesk generates a typed client for it. The frontend invokes; the handler runs on a virtual thread; exactly one result crosses back.",
      bullets: [
        "Deny-by-default capability check runs before your code.",
        "Handlers block freely on virtual threads — no async plumbing.",
        "The generated TypeScript client keeps types in sync at compile time.",
      ],
      link: { label: "Defining commands", href: "/docs/defining-commands" },
      javaFilename: "GreetingService.java",
      javaCode:
        '@DesktopCommand("greeting.greet")\n@RequiresCapability("greeting:use")\npublic CompletionStage<Response> greet(Request req, InvocationContext ctx) {\n    return completedFuture(new Response("Hello, " + req.name() + "!"));\n}',
      tsFilename: "ui/src/main.ts",
      tsCode:
        'import { commands } from "./jdesk-ts/commands";\n\nconst res = await commands.greeting.greet({ name: "Tuan" });',
    },
    comparison: {
      eyebrow: "How it compares",
      title: "Same trade-off as Tauri, in the language you already ship.",
      intro:
        "JDesk trades Electron's one-identical-engine guarantee for small apps on each platform's native WebView.",
      rows: [
        { label: "Backend language", jdesk: "Java (JVM)", tauri: "Rust", electron: "Node.js" },
        { label: "Renderer", jdesk: "System WebView", tauri: "System WebView", electron: "Bundled Chromium" },
        { label: "Bundle size", jdesk: "Small (jlink runtime)", tauri: "Smallest", electron: "Large (100+ MB)" },
        { label: "Runtime dependency", jdesk: "Trimmed JVM (bundled)", tauri: "None", electron: "Bundled Chromium" },
        { label: "IPC", jdesk: "Compile-time typed", tauri: "Typed commands", electron: "IPC channels" },
        { label: "Best fit", jdesk: "Java / JVM teams", tauri: "Rust / native teams", electron: "Max web-parity" },
      ],
    },
    cta: {
      title: "Scaffold an app in one command.",
      subtitle:
        "Pick a template — basic, React, Vue, Svelte, or a structured multi-module layout — and run it on your OS.",
      command: "npx create-jdesk-app@latest my-app",
      ctaPrimary: { label: "Installation guide", href: "/docs/installation" },
      ctaSecondary: { label: "Browse the docs", href: "/docs" },
    },
  },
  footer: {
    tagline:
      "Desktop apps with a Java 25 core and a web UI, rendered by the operating system's own WebView. The Tauri model, without Rust.",
    columns: [],
    legal:
      "Apache-2.0 licensed. JDesk is open source and under active development.",
  },
};

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API}/site-content`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONTENT;
    const data = (await res.json()) as Partial<SiteContent>;
    return {
      general: { ...DEFAULT_CONTENT.general, ...(data.general ?? {}) },
      nav: { ...DEFAULT_CONTENT.nav, ...(data.nav ?? {}) },
      home: { ...DEFAULT_CONTENT.home, ...(data.home ?? {}) },
      footer: { ...DEFAULT_CONTENT.footer, ...(data.footer ?? {}) },
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}
