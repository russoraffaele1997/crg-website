"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reloading a page (F5) should keep the visitor where they were, not dump
 * them back at the top. Browsers normally handle this on their own via
 * `history.scrollRestoration`, but it's unreliable here: the homepage's
 * scroll-driven parallax section only reaches its full height once client
 * JS/images/fonts finish settling, so the browser's own restore attempt
 * (which runs early) often lands short. We take manual control instead and
 * retry the restore for a bit until the page is actually tall enough.
 */
export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const key = `scrollY:${pathname}`;
    const saved = sessionStorage.getItem(key);

    if (saved) {
      const targetY = Number(saved);
      let attempts = 0;
      const tryRestore = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll >= targetY || attempts > 60) {
          window.scrollTo(0, targetY);
        } else {
          attempts++;
          requestAnimationFrame(tryRestore);
        }
      };
      tryRestore();
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sessionStorage.setItem(key, String(window.scrollY));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
