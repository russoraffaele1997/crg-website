"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OPEN_BANNER_EVENT, openCookieBanner, readConsent, saveConsent, type ConsentChoice } from "@/lib/consent";

/**
 * Consent banner for third-party cookies (Google Maps on project pages).
 * Accept and reject carry the same visual weight and closing with the X
 * counts as a rejection, as required by the Garante's guidelines.
 */
export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_BANNER_EVENT, reopen);
    return () => window.removeEventListener(OPEN_BANNER_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Preferenze cookie"
      className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="relative max-w-3xl mx-auto bg-white border border-border-warm shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-5 sm:p-6">
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-mid-gray hover:text-charcoal"
          aria-label="Chiudi e rifiuta i cookie non necessari"
        >
          ✕
        </button>
        <p className="font-heading text-base font-bold text-charcoal mb-2 pr-8">Usiamo i cookie solo dove servono</p>
        <p className="font-sans text-sm text-mid-gray leading-relaxed mb-5">
          Il sito usa cookie tecnici per funzionare. Con il tuo consenso mostriamo anche la mappa di Google Maps nelle
          pagine dei progetti: Google può usare propri cookie, anche di profilazione. Puoi cambiare idea quando vuoi da
          &quot;Preferenze cookie&quot; in fondo alla pagina.{" "}
          <Link href="/privacy#cookie" className="text-crg-red underline underline-offset-2">
            Leggi la cookie policy
          </Link>
          .
        </p>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
          <button type="button" onClick={() => choose("rejected")} className="btn-outline px-6">
            Rifiuta
          </button>
          <button type="button" onClick={() => choose("accepted")} className="btn-primary px-6">
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link that reopens the banner. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieBanner} className={className}>
      Preferenze cookie
    </button>
  );
}
