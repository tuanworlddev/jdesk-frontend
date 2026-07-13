import type { ReactNode } from "react";
import { DocSidebar } from "./_components/doc-sidebar";
import { fetchDocsNav } from "../lib/docs";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { groups } = await fetchDocsNav();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:gap-8 lg:px-8">
      <DocSidebar groups={groups} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
