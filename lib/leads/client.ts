// Shape of what the public forms send to /api/appointments. Only identifiers
// travel from the browser: unit details, prices and files are always looked
// up again on the server.
export type LeadType = "contact" | "appointment" | "notify" | "document";

export interface LeadPayload {
  type: LeadType;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  projectId?: string;
  unitCode?: string;
  carBoxId?: string;
  documentId?: string;
  preferredDay?: string;
  preferredTime?: string;
  subject?: string;
  message?: string;
  privacy: boolean;
}

export async function submitLead(payload: LeadPayload): Promise<{ documentUrl?: string }> {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Errore nell'invio. Riprova o contattaci direttamente.");
  return data;
}

export const PRIVACY_URL = "/privacy";
