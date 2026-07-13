"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides the public site chrome (header, footer, feedback) on /admin routes. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
