"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiSend } from "../../lib/api";
import { useRequireAdmin } from "../../lib/admin-auth";
import { renderMarkdown } from "../../lib/markdown";
import { AdminShell, AdminLoading } from "../../components/admin/admin-shell";

type Doc = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  group: string;
  order: number;
  content: string;
  published: boolean;
};

const BLANK: Doc = {
  slug: "",
  title: "",
  description: "",
  eyebrow: "Docs",
  group: "Guides",
  order: 0,
  content: "# New document\n\nWrite Markdown here.",
  published: true,
};

function Editor() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const { user, token, ready } = useRequireAdmin();

  const [doc, setDoc] = useState<Doc>(BLANK);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    if (!id) {
      setLoaded(true);
      return;
    }
    apiGet<Doc>(`/documents/admin/${id}`, token)
      .then((d) => {
        setDoc(d);
        setLoaded(true);
      })
      .catch((e) => setError(e?.message ?? "Failed to load"));
  }, [ready, token, id]);

  if (!ready || !loaded) return <AdminLoading />;

  const set = <K extends keyof Doc>(k: K, v: Doc[K]) =>
    setDoc((d) => ({ ...d, [k]: v }));

  async function save() {
    if (!token) return;
    setBusy(true);
    setError("");
    const payload = {
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      eyebrow: doc.eyebrow,
      group: doc.group,
      order: Number(doc.order),
      content: doc.content,
      published: doc.published,
    };
    try {
      if (id) {
        await apiSend("PATCH", `/documents/${id}`, payload, token);
      } else {
        await apiSend("POST", "/documents", payload, token);
      }
      router.push("/admin");
    } catch (e) {
      setError((e as { message?: string })?.message ?? "Save failed");
      setBusy(false);
    }
  }

  async function remove() {
    if (!token || !id) return;
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await apiSend("DELETE", `/documents/${id}`, undefined, token);
    router.push("/admin");
  }

  return (
    <AdminShell user={user}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-fg-muted hover:text-fg"
          >
            ← Back
          </button>
          <h1 className="mt-1 font-display text-2xl font-semibold text-fg">
            {id ? "Edit document" : "New document"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {id && (
            <button
              onClick={remove}
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ember hover:border-ember/50"
            >
              Delete
            </button>
          )}
          <button
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-fg px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-ember/40 bg-ember-soft px-3 py-2 text-sm text-ember">
          {error}
        </p>
      )}

      {/* metadata */}
      <div className="mb-6 grid gap-4 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            value={doc.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Slug (/docs/…)">
          <input
            value={doc.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="my-page"
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <input
            value={doc.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Eyebrow">
          <input
            value={doc.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Group">
          <input
            value={doc.group}
            onChange={(e) => set("group", e.target.value)}
            placeholder="Guides"
            className={inputCls}
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            value={doc.order}
            onChange={(e) => set("order", Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={doc.published}
            onChange={(e) => set("published", e.target.checked)}
            className="h-4 w-4 accent-[var(--arc)]"
          />
          Published
        </label>
      </div>

      {/* markdown + live preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-faint">
            Markdown
          </div>
          <textarea
            value={doc.content}
            onChange={(e) => set("content", e.target.value)}
            spellCheck={false}
            className="no-focus-ring h-[60vh] w-full resize-none rounded-xl border border-line bg-surface p-4 font-mono text-sm leading-relaxed text-fg outline-none focus:border-arc/50"
          />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-faint">
            Preview
          </div>
          <div className="h-[60vh] overflow-y-auto rounded-xl border border-line bg-surface p-6">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

const inputCls =
  "no-focus-ring w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-arc/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-fg-faint">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Editor />
    </Suspense>
  );
}
