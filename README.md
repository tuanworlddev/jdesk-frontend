# JDesk website

The official website and documentation for the [JDesk](../JDesk) framework —
desktop apps with a Java 25 core and a web UI. Built with Next.js 16 (App
Router) and Tailwind CSS v4.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build    # static production build (all routes prerendered)
npm run start    # serve the production build
```

## Structure

```
app/
  layout.tsx              # root layout: fonts, theme bootstrap, header/footer
  page.tsx                # homepage (hero "Bridge", pillars, comparison, CTA)
  globals.css             # design tokens + prose styles ("The Bridge" theme)
  lib/highlight.tsx       # dependency-free syntax highlighter
  components/             # header, footer, code block, callout, bridge hero, ui
  docs/
    layout.tsx            # docs shell (sidebar + content)
    nav.ts                # sidebar navigation + prev/next order
    _components/          # doc-sidebar, toc (scrollspy), doc-article, prose
    page.tsx              # documentation hub
    <topic>/page.tsx      # one page per doc topic
```

## Design

The visual identity is **"The Bridge"**: warm ember represents the Java core,
cool teal the web frontend, and the gradient between them the typed IPC bridge
that connects them. Light and dark themes are driven by CSS custom properties
and a `data-theme` attribute set before first paint. Content is sourced from
the JDesk framework docs under `../JDesk/docs`.
