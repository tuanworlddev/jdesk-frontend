"use client";

import { openFeedback } from "./feedback-widget";

export function FeedbackLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openFeedback}
      className={className || "transition-colors hover:text-fg"}
    >
      Send feedback
    </button>
  );
}
