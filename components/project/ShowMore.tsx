"use client";

import { Children, useState } from "react";

/** Renders the first `initial` children, with a button revealing the rest. */
export default function ShowMore({
  initial,
  moreLabel,
  className,
  children,
}: {
  initial: number;
  moreLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const hidden = items.length - initial;

  return (
    <>
      <div className={className}>{expanded ? items : items.slice(0, initial)}</div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-6 font-sans text-xs tracking-[0.2em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-crg-red hover:border-crg-red transition-colors"
        >
          {expanded ? "Mostra meno" : `${moreLabel} (${hidden})`}
        </button>
      )}
    </>
  );
}
