import type { ReactNode } from "react";
import { DocSidebar } from "./_components/doc-sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:gap-8 lg:px-8">
      <DocSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
