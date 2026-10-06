"use client";

import { useState } from "react";

/**
 * Google Maps embed loaded only after a click: the iframe sets Google cookies,
 * so it must not load on page view (see the Cookie section of /privacy).
 * Uses the key-less embed URL, so no API key or billing is needed.
 */
export default function ProjectMap({ address, title }: { address: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const query = encodeURIComponent(address);
  const embedUrl = `https://www.google.com/maps?q=${query}&z=16&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div>
      <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-light-gray border border-border-warm overflow-hidden">
        {loaded ? (
          <iframe
            src={embedUrl}
            title={`Mappa: ${title}`}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[repeating-linear-gradient(45deg,#f3f3f3_0,#f3f3f3_12px,#ececec_12px,#ececec_24px)]">
            <svg className="w-10 h-10 text-crg-red mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="font-sans text-sm text-charcoal font-medium mb-1">{address}</p>
            <p className="font-sans text-xs text-mid-gray max-w-sm mb-5">
              La mappa è fornita da Google: caricandola, Google può impostare propri cookie.
            </p>
            <button type="button" onClick={() => setLoaded(true)} className="btn-primary">
              Mostra la mappa
            </button>
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
