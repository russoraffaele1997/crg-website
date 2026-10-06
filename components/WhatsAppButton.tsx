"use client";

import { useEffect, useState } from "react";

const BUBBLE_DELAY_MS = 4000;
const DISMISS_KEY = "crg_wa_bubble_dismissed";

/** wa.me wants the number in international format, digits only ("+39 331…" → "39331…"). */
function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  // A bare Italian mobile (10 digits starting with 3) gets the country code.
  return /^3\d{9}$/.test(digits) ? `39${digits}` : digits;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-1.6a12.1 12.1 0 0 0 3.79.61h.01C22.68 28 28 22.64 28 16.03 28 9.42 22.68 3 16.04 3zm0 22.82h-.01c-1.2 0-2.38-.2-3.5-.6l-.25-.09-4.9.95.98-4.73-.16-.26a9.73 9.73 0 0 1-1.52-5.12c0-5.42 4.45-9.83 9.37-9.83 5.33 0 9.67 4.4 9.67 9.82 0 5.43-4.35 9.86-9.68 9.86zm5.3-7.36c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.14-.19.29-.75.94-.92 1.13-.17.2-.34.22-.63.08-.29-.15-1.22-.45-2.33-1.43a8.7 8.7 0 0 1-1.6-2c-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.14-.17.19-.29.29-.48.1-.2.05-.37-.03-.51-.07-.15-.65-1.57-.9-2.15-.23-.56-.47-.49-.65-.5h-.55a1.06 1.06 0 0 0-.77.36c-.26.29-1 .98-1 2.4 0 1.41 1.03 2.78 1.18 2.97.14.19 2.03 3.1 4.92 4.34.69.3 1.22.47 1.64.6.69.22 1.32.19 1.81.11.55-.08 1.72-.7 1.96-1.38.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.34z" />
    </svg>
  );
}

/**
 * Floating WhatsApp button: opens a chat with a ready-made message. A small
 * welcome bubble appears after a few seconds and stays closed for the rest of
 * the visit once dismissed. wa.me is a plain link: nothing loads (and no
 * cookies are set) until the visitor clicks.
 */
export default function WhatsAppButton({ phone, message }: { phone: string; message: string }) {
  const [showBubble, setShowBubble] = useState(false);
  const number = waNumber(phone);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setShowBubble(true), BUBBLE_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`;
  const dismiss = () => {
    setShowBubble(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[80] flex flex-col items-end gap-3">
      {showBubble && (
        <div className="relative max-w-[260px] bg-white border border-border-warm shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl rounded-br-sm p-4 pr-9">
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-mid-gray hover:text-charcoal text-xs"
            aria-label="Chiudi messaggio"
          >
            ✕
          </button>
          <p className="font-heading text-sm font-bold text-charcoal mb-1">Ciao! 👋</p>
          <p className="font-sans text-[13px] text-mid-gray leading-snug">
            Cerchi casa? Scrivici su WhatsApp: ti rispondiamo al più presto con disponibilità, prezzi e visite.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="inline-block mt-3 font-sans text-[13px] font-semibold text-[#128C7E] hover:underline"
          >
            Inizia la chat →
          </a>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        aria-label="Scrivici su WhatsApp"
        className="group relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:bg-[#1EBE5A] hover:scale-105 transition-all"
      >
        {/* A few pulses to catch the eye, then it stays still */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:hidden" style={{ animationIterationCount: 4 }} aria-hidden />
        <WhatsAppIcon className="relative w-8 h-8 md:w-9 md:h-9" />
      </a>
    </div>
  );
}
