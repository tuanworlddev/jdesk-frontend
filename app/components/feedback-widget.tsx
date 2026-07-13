"use client";

import { useEffect, useRef, useState } from "react";
import { apiSend, type FeedbackInput } from "../lib/api";

const OPEN_EVENT = "jdesk:open-feedback";

/** Open the feedback modal from anywhere (e.g. a footer link). */
export function openFeedback() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Status = "idle" | "sending" | "done" | "error";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FeedbackInput>({
    email: "",
    fullName: "",
    content: "",
    website: "",
  });
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setError("");
      const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [open]);

  function reset() {
    setForm({ email: "", fullName: "", content: "", website: "" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await apiSend("POST", "/feedback", form);
      setStatus("done");
      reset();
    } catch (err) {
      setStatus("error");
      setError((err as { message?: string })?.message ?? "Something went wrong");
    }
  }

  const set =
    (k: keyof FeedbackInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/90 px-4 py-2.5 text-sm font-semibold text-fg shadow-lg backdrop-blur transition-colors hover:border-arc/50 hover:text-arc-strong"
        aria-haspopup="dialog"
      >
        <ChatIcon />
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Send feedback"
              className="overflow-hidden rounded-2xl border border-line-strong bg-bg shadow-2xl"
            >
              <div className="relative border-b border-line px-6 py-5">
                <div className="pointer-events-none absolute inset-0 signal-field opacity-40" />
                <div className="relative">
                  <h2 className="font-display text-xl font-semibold text-fg">
                    {status === "done" ? "Thank you" : "Send feedback"}
                  </h2>
                  <p className="mt-1 text-sm text-fg-muted">
                    {status === "done"
                      ? "Your feedback reached the team. We read every note."
                      : "Found a bug or have a suggestion? Tell us."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg border border-line text-fg-muted hover:text-fg"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {status === "done" ? (
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-arc/40 bg-arc-soft">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6 9 17l-5-5" stroke="var(--arc)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-xl bg-fg px-5 py-2.5 text-sm font-semibold text-bg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4 px-6 py-5">
                  {/* honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={set("website")}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="hidden"
                  />

                  <Field label="Full name">
                    <input
                      ref={firstFieldRef}
                      required
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Ada Lovelace"
                      className="no-focus-ring w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-arc/50"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      className="no-focus-ring w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-arc/50"
                    />
                  </Field>

                  <Field label="Message">
                    <textarea
                      required
                      value={form.content}
                      onChange={set("content")}
                      rows={4}
                      placeholder="What's on your mind?"
                      className="no-focus-ring w-full resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-arc/50"
                    />
                  </Field>

                  {status === "error" && (
                    <p className="rounded-lg border border-ember/40 bg-ember-soft px-3 py-2 text-sm text-ember">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full rounded-xl bg-fg px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send feedback"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
