export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { DOCS_FLAT } from "./docs/nav";

const BASE = "https://jdesk.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/docs", ...DOCS_FLAT.map((l) => l.href)];
  return paths.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path === "/docs" ? 0.9 : 0.7,
  }));
}