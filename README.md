# JDesk website

The standalone official website and documentation for the JDesk framework —
desktop apps with a Java 25 core and a web UI. Built with Next.js 16 (App
Router) and Tailwind CSS v4.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build and run

```bash
npm run build    # compile the Next.js SSR application
npm run start    # serve it on http://localhost:3000
```

Documentation and homepage content are read from the sibling NestJS CMS at
request time. Set `API_INTERNAL_URL` for server-side access and
`NEXT_PUBLIC_API_URL` for browser requests; both default to the local API on
port 3001 during development.

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
    <topic>/page.tsx      # hand-crafted core pages
    [slug]/page.tsx       # standalone Markdown-backed reference pages
content/docs/             # source-controlled docs imported into the CMS
```

## Design

The visual identity is **"The Bridge"**: warm ember represents the Java core,
cool teal the web frontend, and the gradient between them the typed IPC bridge
that connects them. Light and dark themes are driven by CSS custom properties
and a `data-theme` attribute set before first paint. All production content is
stored in this repository; the build has no dependency on a JDesk checkout.
