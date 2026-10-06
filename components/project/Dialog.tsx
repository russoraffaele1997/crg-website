"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: closes on Esc and backdrop click, keeps focus inside,
 * restores it on close and locks page scroll. On phones it becomes a
 * full-height sheet sliding from the bottom.
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full ${size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl"} max-h-[92vh] sm:max-h-[85vh] overflow-y-auto relative rounded-t-2xl sm:rounded-none`}
      >
        <div className="sticky top-0 z-10 flex justify-end bg-white/95 backdrop-blur px-5 pt-4 pb-2 sm:absolute sm:right-0 sm:bg-transparent sm:backdrop-blur-0">
          <button
            type="button"
            onClick={onClose}
            className="text-mid-gray hover:text-charcoal font-sans text-sm tracking-widest uppercase"
          >
            Chiudi ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
