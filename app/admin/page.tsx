"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiSend } from "../lib/api";
import { useRequireAdmin } from "../lib/admin-auth";
import { AdminShell, AdminLoading, Tabs } from "../components/admin/admin-shell";

type DocRow = {
  id: string;
  slug: string;
  title: string;
  group: string;
  order: number;
  published: boolean;
  updatedAt: string;
};
type Feedback = {
  id: string;
  email: string;
  fullName: string;
  content: string;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const { user, token, ready } = useRequireAdmin();
  const [tab, setTab] = useState("documents");
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    if (!ready || !token) return;
    apiGet<DocRow[]>("/documents/admin/all", token).then(setDocs).catch(() => {});
    apiGet<Feedback[]>("/feedback", token).then(setFeedback).catch(() => {});
  }, [ready, token]);

  if (!ready) return <AdminLoading />;

  const unread = feedback.filter((f) => f.status === "new").length;
  const groups = [...new Set(docs.map((d) => d.group))];

  async function setStatus(id: string, status: string) {
    if (!token) return;
    await apiSend("PATCH", `/feedback/${id}`, { status }, token);
    setFeedback((fs) => fs.map((f) => (f.id === id ? { ...f, status } : f)));
  }
  async function removeFeedback(id: string) {
    if (!token) return;
    await apiSend("DELETE", `/feedback/${id}`, undefined, token);
    setFeedback((fs) => fs.filter((f) => f.id !== id));
  }

  return (
    <AdminShell user={user}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-fg">Dashboard</h1>
        {tab === "documents" && (
          <Link
            href="/admin/edit"
            className="rounded-lg bg-fg px-4 py-2 text-sm font-semibold text-bg hover:opacity-90"
          >
            + New document
          </Link>
        )}
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "documents", label: "Documents" },
          { id: "feedback", label: "Feedback", badge: unread },
          { id: "content", label: "Interface content" },
        ]}
      />

      {tab === "documents" && (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group}>
              <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-faint">
                {group}
              </h2>
              <div className="overflow-hidden rounded-xl border border-line">
                {docs
                  .filter((d) => d.group === group)
                  .sort((a, b) => a.order - b.order)
                  .map((d, i, arr) => (
                    <Link
                      key={d.id}
                      href={`/admin/edit?id=${d.id}`}
                      className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-2 ${
                        i < arr.length - 1 ? "border-b border-line" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-fg">
                          {d.title}
                        </div>
                        <div className="truncate font-mono text-xs text-fg-faint">
                          /docs/{d.slug}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {!d.published && (
                          <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
                            Draft
                          </span>
                        )}
                        <span className="text-fg-faint">Edit →</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "feedback" && (
        <div className="space-y-3">
          {feedback.length === 0 && (
            <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-fg-muted">
              No feedback yet.
            </p>
          )}
          {feedback.map((f) => (
            <div key={f.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-fg">{f.fullName}</span>
                  <span className="font-mono text-xs text-fg-faint">
                    {f.email}
                  </span>
                  <StatusPill status={f.status} />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {f.status !== "read" && (
                    <button
                      onClick={() => setStatus(f.id, "read")}
                      className="rounded-md border border-line px-2 py-1 text-fg-muted hover:text-fg"
                    >
                      Mark read
                    </button>
                  )}
                  {f.status !== "resolved" && (
                    <button
                      onClick={() => setStatus(f.id, "resolved")}
                      className="rounded-md border border-line px-2 py-1 text-fg-muted hover:text-fg"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => removeFeedback(f.id)}
                    className="rounded-md border border-line px-2 py-1 text-ember hover:border-ember/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-fg-muted">
                {f.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "content" && <SiteContentEditor token={token} />}
    </AdminShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "border-ember/40 bg-ember-soft text-ember",
    read: "border-line bg-surface-2 text-fg-muted",
    resolved: "border-arc/40 bg-arc-soft text-arc-strong",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${map[status] ?? map.read}`}
    >
      {status}
    </span>
  );
}

function SiteContentEditor({ token }: { token: string | null }) {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Record<string, unknown>>("/site-content")
      .then((c) => {
        setContent(c);
        const d: Record<string, string> = {};
        for (const [k, v] of Object.entries(c)) d[k] = JSON.stringify(v, null, 2);
        setDrafts(d);
      })
      .catch(() => {});
  }, []);

  async function save(key: string) {
    if (!token) return;
    setError(null);
    let value: unknown;
    try {
      value = JSON.parse(drafts[key]);
    } catch {
      setError(`${key}: invalid JSON`);
      return;
    }
    await apiSend("PUT", `/site-content/${key}`, { value }, token);
    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-fg-muted">
        Every interface section (homepage, nav, footer, general) as editable
        JSON. Save applies immediately once the site renders from the API.
      </p>
      {error && (
        <p className="rounded-lg border border-ember/40 bg-ember-soft px-3 py-2 text-sm text-ember">
          {error}
        </p>
      )}
      {Object.keys(content).map((key) => (
        <div key={key} className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-arc-strong">
              {key}
            </span>
            <button
              onClick={() => save(key)}
              className="rounded-lg bg-fg px-3 py-1.5 text-xs font-semibold text-bg hover:opacity-90"
            >
              {saved === key ? "Saved ✓" : "Save"}
            </button>
          </div>
          <textarea
            value={drafts[key] ?? ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
            spellCheck={false}
            rows={10}
            className="no-focus-ring w-full resize-y rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-xs text-fg outline-none focus:border-arc/50"
          />
        </div>
      ))}
    </div>
  );
}
