"use client";

import { useState } from "react";
import { openCookieBanner, useConsent } from "@/lib/consent";

/**
 * Google Maps embed of the building site. It sets Google cookies, so it loads
 * straight away only for visitors who accepted cookies in the banner; the
 * others get a placeholder and can load this one map with a click.
 * Uses the key-less embed URL: no API key or billing needed.
 */
export default function ProjectMap({ address, title }: { address: string; title: string }) {
  const consent = useConsent();
  const [loadedOnce, setLoadedOnce] = useState(false);
  const query = encodeURIComponent(address);
  const embedUrl = `https://www.google.com/maps?q=${query}&z=16&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const showMap = consent === "accepted" || loadedOnce;

  return (
    <div>
      <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-light-gray border border-border-warm overflow-hidden">
        {showMap ? (
          <iframe
            src={embedUrl}
            title={`Mappa: ${title}`}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : consent === undefined ? null : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[repeating-linear-gradient(45deg,#f3f3f3_0,#f3f3f3_12px,#ececec_12px,#ececec_24px)]">
            <svg className="w-10 h-10 text-crg-red mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="font-sans text-sm text-charcoal font-medium mb-1">{address}</p>
            <p className="font-sans text-xs text-mid-gray max-w-sm mb-5">
              La mappa è fornita da Google, che può usare propri cookie. Per vederla accetta i cookie oppure caricala solo
              questa volta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setLoadedOnce(true)} className="btn-primary">
                Mostra la mappa
              </button>
              <button type="button" onClick={openCookieBanner} className="btn-outline">
                Preferenze cookie
              </button>
            </div>
          </div>
        )}
      </div>
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 font-sans text-sm text-crg-red hover:underline"
      >
        Apri in Google Maps e calcola il percorso ↗
      </a>
    </div>
  );
}
