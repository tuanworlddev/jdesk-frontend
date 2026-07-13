// Server-side data access for DB-driven docs. Fetches from the NestJS CMS API.
// Uses no-store so admin edits appear on the next request (true SSR).

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

export type DocListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  group: string;
  order: number;
  published: boolean;
};

export type DocFull = DocListItem & { content: string };

export type DocLink = { title: string; href: string };
export type DocGroup = { title: string; items: DocLink[] };

// Display order for known groups; unknown groups sort to the end alphabetically.
const GROUP_ORDER = ["Getting started", "Guides", "Concepts", "Reference"];

function groupRank(group: string): number {
  const i = GROUP_ORDER.indexOf(group);
  return i === -1 ? GROUP_ORDER.length : i;
}

export async function fetchDocList(): Promise<DocListItem[]> {
  try {
    const res = await fetch(`${API}/documents`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchDoc(slug: string): Promise<DocFull | null> {
  try {
    const res = await fetch(`${API}/documents/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Build the grouped sidebar nav + a flat ordered list for prev/next. */
export async function fetchDocsNav(): Promise<{
  groups: DocGroup[];
  flat: DocLink[];
}> {
  const docs = await fetchDocList();
  const sorted = [...docs].sort(
    (a, b) => groupRank(a.group) - groupRank(b.group) || a.order - b.order,
  );

  const groups: DocGroup[] = [];
  const flat: DocLink[] = [];
  for (const doc of sorted) {
    const link = { title: doc.title, href: `/docs/${doc.slug}` };
    flat.push(link);
    let group = groups.find((g) => g.title === doc.group);
    if (!group) {
      group = { title: doc.group, items: [] };
      groups.push(group);
    }
    group.items.push(link);
  }
  return { groups, flat };
}

export function siblingsOf(flat: DocLink[], href: string) {
  const i = flat.findIndex((l) => l.href === href);
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null,
  };
}
