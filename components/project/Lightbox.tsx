"use client";

import { useEffect, useRef, useState } from "react";
import ClientImage from "@/components/ClientImage";

/** Full-screen photo viewer with arrows, keyboard (← → Esc) and swipe. */
export default function Lightbox({
  images,
  startIndex,
  alt,
  onClose,
}: {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const count = images.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [count]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt}: foto ${index + 1} di ${count}`}
      className="fixed inset-0 bg-black/95 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="absolute top-5 right-5 text-white/60 hover:text-white font-sans text-sm tracking-widest uppercase"
        onClick={onClose}
      >
        Chiudi ✕
      </button>

      <ClientImage
        src={images[index]}
        alt={`${alt}: foto ${index + 1}`}
        className="max-w-5xl w-full max-h-[80vh] object-contain"
        fallbackClass="w-96 h-64 bg-anthracite"
      />

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto precedente"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white text-3xl"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Foto successiva"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white text-3xl"
          >
            ›
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-xs tracking-widest text-white/60">
            {index + 1} / {count}
          </p>
        </>
      )}
    </div>
  );
}
