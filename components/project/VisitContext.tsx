"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface VisitSelection {
  unitCode: string;
  carBoxId: string;
}

interface VisitContextValue extends VisitSelection {
  setUnitCode: (code: string) => void;
  setCarBoxId: (id: string) => void;
  /** Pre-fills the visit form with a unit (and optional car box) and scrolls to it. */
  requestVisit: (unitCode: string, carBoxId?: string) => void;
}

const VisitContext = createContext<VisitContextValue | null>(null);

/** Lets the units table and the visit form (separate islands on the page) share the chosen unit. */
export function VisitProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<VisitSelection>({ unitCode: "", carBoxId: "" });

  const setUnitCode = useCallback((unitCode: string) => setSelection((s) => ({ ...s, unitCode })), []);
  const setCarBoxId = useCallback((carBoxId: string) => setSelection((s) => ({ ...s, carBoxId })), []);
  const requestVisit = useCallback((unitCode: string, carBoxId = "") => {
    setSelection({ unitCode, carBoxId });
    requestAnimationFrame(() => document.getElementById("prenota")?.scrollIntoView({ behavior: "smooth" }));
  }, []);

  return (
    <VisitContext.Provider value={{ ...selection, setUnitCode, setCarBoxId, requestVisit }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisit(): VisitContextValue {
  const ctx = useContext(VisitContext);
  if (!ctx) throw new Error("useVisit must be used inside <VisitProvider>");
  return ctx;
}
