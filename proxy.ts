import { NextRequest, NextResponse } from "next/server";

// Per-request nonce CSP for SSR — the dynamic-rendering equivalent of the old
// build-time hashed CSP. Scripts are locked to a fresh nonce + strict-dynamic;
// the rest of the policy mirrors the previous static one.

function apiOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL || "";
  if (!url.startsWith("http")) return null; // same-origin ("/api") → covered by 'self'
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  // Only force HTTPS upgrades when actually served over HTTPS — otherwise the
  // browser would upgrade CSS/JS to an https origin that doesn't exist yet
  // (e.g. when reaching the box over http://<ip> before certbot is set up).
  const isHttps = request.headers.get("x-forwarded-proto") === "https";
  const connectExtra = [apiOrigin(), isDev ? "ws: wss:" : ""]
    .filter(Boolean)
    .join(" ");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self' data:;
    connect-src 'self'${connectExtra ? " " + connectExtra : ""};
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';${isHttps ? "\n    upgrade-insecure-requests;" : ""}
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|theme-init.js).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
