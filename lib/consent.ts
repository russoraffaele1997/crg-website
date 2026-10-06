"use client";

import { useEffect, useState } from "react";

// Cookie consent for third-party content (Google Maps). The choice itself is
// stored in a first-party technical cookie, valid 6 months as suggested by the
// Garante's cookie guidelines (10 June 2021).
export type ConsentChoice = "accepted" | "rejected";

const COOKIE_NAME = "crg_cookie_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 182;
const CHANGE_EVENT = "crg-consent-change";
export const OPEN_BANNER_EVENT = "crg-open-cookie-banner";

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=(accepted|rejected)`));
  return (match?.[1] as ConsentChoice | undefined) ?? null;
}

export function saveConsent(choice: ConsentChoice) {
  document.cookie = `${COOKIE_NAME}=${choice}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: choice }));
}

export function openCookieBanner() {
  window.dispatchEvent(new Event(OPEN_BANNER_EVENT));
}

/** Current choice; `undefined` until read on the client (avoids hydration mismatches). */
export function useConsent(): ConsentChoice | null | undefined {
  const [choice, setChoice] = useState<ConsentChoice | null | undefined>(undefined);
  useEffect(() => {
    setChoice(readConsent());
    const onChange = (e: Event) => setChoice((e as CustomEvent<ConsentChoice>).detail);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);
  return choice;
}
