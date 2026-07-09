"use client";

import { useState, useEffect } from "react";
import { Link2, Check } from "lucide-react";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  // Read the real URL only after mount — reading window.location.href during
  // render makes the server (which has no window) and the client's first
  // render disagree, which is a hydration mismatch. Share links are inert
  // until JS loads anyway, so this one-frame delay is harmless.
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[10px] tracking-widest uppercase text-mid-gray">Condividi</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-border-warm text-mid-gray hover:text-crg-red hover:border-crg-red transition-colors"
        aria-label="Condividi su Facebook"
      >
        <FacebookIcon />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-border-warm text-mid-gray hover:text-crg-red hover:border-crg-red transition-colors"
        aria-label="Condividi su LinkedIn"
      >
        <LinkedinIcon />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="w-8 h-8 flex items-center justify-center border border-border-warm text-mid-gray hover:text-crg-red hover:border-crg-red transition-colors"
        aria-label="Copia link"
        title={title}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
