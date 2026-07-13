"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type ModalDialogOptions = {
  open: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Applies the interaction contract shared by modal UI: focus containment,
 * Escape-to-close, background scroll locking, and focus restoration.
 */
export function useModalDialog({
  open,
  onClose,
  dialogRef,
  triggerRef,
  initialFocusRef,
}: ModalDialogOptions) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const returnTarget = triggerRef.current ?? document.activeElement;
    document.body.style.overflow = "hidden";

    const focusId = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (initialFocusRef?.current ?? first ?? dialogRef.current)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((element) => !element.hidden && element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusId);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (returnTarget instanceof HTMLElement) returnTarget.focus();
    };
  }, [dialogRef, initialFocusRef, onClose, open, triggerRef]);
}
