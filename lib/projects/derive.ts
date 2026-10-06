// Pure rules that turn raw project data into what the visitor sees: status
// wording, availability, construction progress, the "next action" and alerts.
// Kept free of server/client-only imports so cards, pages and the admin
// checklist all share exactly the same logic.
import type {
  AlertTone,
  ProjectCategory,
  ProjectMessaging,
  ProjectStatus,
  UnitCounts,
  UnitStatus,
} from "@/lib/types/project";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  "for-sale": "In vendita",
  "under-construction": "In costruzione",
  "coming-soon": "In arrivo",
  "for-rent": "In affitto",
};

export const UNIT_STATUS_PUBLIC: Record<UnitStatus, string> = {
  available: "Disponibile",
  optioned: "Prenotata",
  sold: "Venduta",
  rented: "Affittata",
  reserved: "Riservata",
};

/** A recent diary entry gets highlighted for this many days. */
export const RECENT_UPDATE_DAYS = 14;

export function resolveStatusLabel(status: ProjectStatus, custom: string | null | undefined): string {
  return custom?.trim() || PROJECT_STATUS_LABELS[status];
}

/** Optioned units can still be visited, so they stay selectable for a visit request. */
export function isSelectable(status: UnitStatus): boolean {
  return status === "available" || status === "optioned";
}

export function countUnits(units: { status: UnitStatus }[]): UnitCounts {
  const counts: UnitCounts = { total: units.length, available: 0, optioned: 0, closed: 0 };
  for (const u of units) {
    if (u.status === "available") counts.available++;
    else if (u.status === "optioned") counts.optioned++;
    else counts.closed++;
  }
  return counts;
}

export function unitNoun(category: ProjectCategory, n: number): string {
  if (category === "residential") return n === 1 ? "appartamento" : "appartamenti";
  return "unità";
}

/**
 * Prices are free text in the CMS ("€ 240.000", "240.000,00 €", "Su richiesta").
 * Returns null whenever the text isn't clearly a number, so a "da €…" is only
 * ever shown when it's real.
 */
export function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,]/g, "");
  if (!/\d/.test(cleaned)) return null;
  // Italian format: "." thousands, "," decimals ("240.000,00").
  const normalized = /,\d{1,2}$/.test(cleaned)
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/[.,]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 1000 ? value : null;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

/** Lowest price among available units (optioned ones only when nothing else is left). */
export function priceFrom(units: { status: UnitStatus; price?: string | null }[]): string | null {
  const lowest = (status: UnitStatus) => {
    const prices = units
      .filter((u) => u.status === status)
      .map((u) => parsePrice(u.price))
      .filter((p): p is number => p !== null);
    return prices.length ? Math.min(...prices) : null;
  };
  const value = lowest("available") ?? lowest("optioned");
  return value !== null ? formatEuro(value) : null;
}

/** Weighted share of completed phases, 0–100. Null when there are no phases yet. */
export function computeProgress(phases: { completed: boolean; weight?: number }[]): number | null {
  if (phases.length === 0) return null;
  const total = phases.reduce((sum, p) => sum + (p.weight ?? 1), 0);
  const done = phases.filter((p) => p.completed).reduce((sum, p) => sum + (p.weight ?? 1), 0);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/**
 * "Where are we": the current phase is the first one not yet completed (phases
 * are ordered by the admin), the next one follows it.
 */
export function phaseState<T extends { completed: boolean }>(phases: T[]) {
  const currentIndex = phases.findIndex((p) => !p.completed);
  const allDone = phases.length > 0 && currentIndex === -1;
  return {
    currentIndex,
    current: currentIndex >= 0 ? phases[currentIndex] : null,
    next: currentIndex >= 0 ? phases[currentIndex + 1] ?? null : null,
    allDone,
  };
}

/** Today in Italy as yyyy-mm-dd, comparable as a plain string with DB dates. */
export function todayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(now);
}

export function formatMonthYear(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

export function formatDayMonth(iso: string, withYear = false): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function deliveryLabel(m: Pick<ProjectMessaging, "expectedDelivery" | "expectedDeliveryLabel">): string | null {
  if (m.expectedDeliveryLabel?.trim()) return m.expectedDeliveryLabel.trim();
  return m.expectedDelivery ? formatMonthYear(m.expectedDelivery) : null;
}

function isActive(expiresOn: string | null, today: string): boolean {
  return !expiresOn || expiresOn >= today;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T12:00:00`) - Date.parse(`${fromIso}T12:00:00`)) / 86_400_000);
}

export function isRecent(dateIso: string | null | undefined, today: string): boolean {
  if (!dateIso) return false;
  const age = daysBetween(dateIso, today);
  return age >= 0 && age <= RECENT_UPDATE_DAYS;
}

export function isLowStock(counts: UnitCounts, threshold: number): boolean {
  return counts.available > 0 && counts.available <= threshold;
}

export type NextActionTone = "action" | "wait" | "done";

export interface NextAction {
  tone: NextActionTone;
  title: string;
  text?: string;
  cta: { label: string; href: string };
}

export const ANCHORS = {
  units: "#unita",
  visit: "#prenota",
  notify: "#avvisami",
} as const;

/**
 * The single most visible message on a project page: what makes sense to do
 * right now. Automatic by default, overridable by the admin with an expiry.
 */
export function nextAction(input: {
  category: ProjectCategory;
  status: ProjectStatus;
  counts: UnitCounts;
  messaging: ProjectMessaging;
  today: string;
}): NextAction | null {
  const { category, status, counts, messaging, today } = input;
  if (messaging.nextActionHidden) return null;

  const selectable = counts.available + counts.optioned;
  const visitCta = { label: "Prenota una visita", href: ANCHORS.visit };
  const notifyCta = { label: "Avvisami", href: ANCHORS.notify };

  if (messaging.nextActionText?.trim() && isActive(messaging.nextActionExpiresOn, today)) {
    return {
      tone: "action",
      title: messaging.nextActionText.trim(),
      cta: selectable > 0 ? visitCta : notifyCta,
    };
  }

  if (counts.total === 0 || (status === "coming-soon" && selectable === 0)) {
    return {
      tone: "wait",
      title: "Le vendite apriranno a breve.",
      text: "Lasciaci la tua email: ti avviseremo appena saranno disponibili prezzi e planimetrie.",
      cta: { label: "Voglio essere tra i primi", href: ANCHORS.notify },
    };
  }

  if (isLowStock(counts, messaging.lowStockThreshold)) {
    return {
      tone: "action",
      title:
        counts.available === 1
          ? `È rimasto un solo ${unitNoun(category, 1)} disponibile.`
          : `Ultime ${counts.available} ${unitNoun(category, counts.available)} disponibili.`,
      text:
        counts.available === 1
          ? "Prenota subito una visita con il nostro team."
          : "Prenota una visita per vederle di persona con il nostro team.",
      cta: { label: "Prenota subito", href: ANCHORS.visit },
    };
  }

  if (counts.available > 0) {
    return {
      tone: "action",
      title: `Ci sono ancora ${counts.available} ${unitNoun(category, counts.available)} disponibili.`,
      text: "Scegli quella che ti interessa e prenota una visita: ti ricontattiamo entro 24 ore.",
      cta: visitCta,
    };
  }

  if (counts.optioned > 0) {
    return {
      tone: "wait",
      title: "Tutte le unità sono prenotate, ma qualcosa potrebbe liberarsi.",
      text: "Lasciaci la tua email e ti avvisiamo subito se un'unità torna disponibile.",
      cta: { label: "Avvisami se si libera", href: ANCHORS.notify },
    };
  }

  return {
    tone: "done",
    title: "Questo progetto è completo: tutte le unità sono state vendute.",
    text: "Scopri gli altri progetti CRG ancora disponibili.",
    cta: { label: "Vedi gli altri progetti", href: "/progetti" },
  };
}

export interface ProjectAlert {
  tone: AlertTone;
  text: string;
}

/** At most two, never intrusive: the admin's own message first, then a fresh diary entry. */
export function projectAlerts(input: {
  messaging: ProjectMessaging;
  latestUpdate: string | null;
  today: string;
}): ProjectAlert[] {
  const { messaging, latestUpdate, today } = input;
  const alerts: ProjectAlert[] = [];

  if (messaging.alertText?.trim() && isActive(messaging.alertExpiresOn, today)) {
    alerts.push({ tone: messaging.alertTone ?? "info", text: messaging.alertText.trim() });
  }
  if (messaging.autoAlertsEnabled && latestUpdate && isRecent(latestUpdate, today)) {
    alerts.push({ tone: "info", text: `Nuovo aggiornamento dal cantiere del ${formatDayMonth(latestUpdate)}.` });
  }
  return alerts.slice(0, 2);
}
