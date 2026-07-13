import type { MetadataRoute } from "next";
import { fetchDocList } from "./lib/docs";

const BASE = "https://jdesk.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await fetchDocList().catch(() => []);
  const paths = ["", "/docs", ...docs.map((d) => `/docs/${d.slug}`)];
  return paths.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path === "/docs" ? 0.9 : 0.7,
  }));
}
