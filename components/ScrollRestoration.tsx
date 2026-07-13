"use client";

import { useEffect } from "react";

/**
 * Reloading a page should always land at the top. Left to its own devices
 * the browser sometimes tries to restore the previous scroll position on
 * reload (`history.scrollRestoration` defaults to "auto"), which looks
 * broken here since the homepage's scroll-driven parallax section only
 * reaches its full height once client JS/images/fonts finish settling —
 * so we take manual control and force it to the top ourselves.
 */
export default function ScrollRestoration() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
