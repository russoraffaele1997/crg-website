import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

const LEADS_EMAIL = "clienti@crgcostruzioni.it";

interface AppointmentPayload {
  type?: "contact" | "appointment";
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  projectId?: string;
  projectTitle?: string;
  unitId?: string;
  unitDetails?: string;
  carBoxDetails?: string;
  preferredDay?: string;
  preferredTime?: string;
  subject?: string;
  message?: string;
  privacy?: boolean;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function POST(request: NextRequest) {
  let body: AppointmentPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const { firstName, lastName, email, privacy } = body;

  // Server-side validation
  if (!firstName?.trim()) {
    return NextResponse.json({ error: "Il nome è obbligatorio." }, { status: 422 });
  }
  if (!lastName?.trim()) {
    return NextResponse.json({ error: "Il cognome è obbligatorio." }, { status: 422 });
  }
  if (!email?.trim() || !validateEmail(email)) {
    return NextResponse.json({ error: "Email non valida." }, { status: 422 });
  }
  if (!privacy) {
    return NextResponse.json({ error: "Il consenso alla privacy è obbligatorio." }, { status: 422 });
  }

  const type = body.type ?? "appointment";

  // ─── Persist the lead ───────────────────────────────────────────────────
  // unitId sent by the form is the unit's public-facing code (e.g. "A01"),
  // not its database UUID, so it can't go straight into the unit_id FK —
  // fold the full unit sheet into the message instead rather than risk an
  // insert failure (and rather than showing staff a bare, unreadable code).
  const service = createServiceClient();
  const messageParts = [
    body.unitDetails ? `Unità di interesse:\n${body.unitDetails}` : null,
    body.carBoxDetails ? `Box auto scelto: ${body.carBoxDetails}` : null,
    body.message || null,
  ].filter(Boolean);
  const fullMessage = messageParts.length ? messageParts.join("\n\n") : null;

  const { error: insertError } = await service.from("lead_submissions").insert({
    type,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim(),
    phone: body.phone || null,
    project_id: body.projectId || null,
    preferred_day: body.preferredDay || null,
    preferred_time: body.preferredTime || null,
    subject: body.subject || null,
    message: fullMessage,
    privacy_accepted: privacy,
  });

  if (insertError) {
    console.error("[CRG] Errore salvataggio richiesta:", insertError.message);
  }

  // ─── Send the notification email ───────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const rows: [string, string | undefined][] = [
        ["Tipo", type === "contact" ? "Contatto" : "Appuntamento"],
        ["Nome", `${firstName} ${lastName}`],
        ["Email", email],
        ["Telefono", body.phone],
        ["Progetto", body.projectTitle],
        ["Unità di interesse", body.unitDetails],
        ["Box auto", body.carBoxDetails],
        ["Giorno preferito", body.preferredDay],
        ["Fascia oraria", body.preferredTime],
        ["Oggetto", body.subject],
        ["Messaggio", body.message],
      ];
      const htmlRows = rows
        .filter(([, value]) => value)
        .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;white-space:nowrap">${label}</td><td style="padding:4px 0">${escapeHtml(String(value)).replace(/\n/g, "<br>")}</td></tr>`)
        .join("");

      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "CRG Website <onboarding@resend.dev>",
        to: LEADS_EMAIL,
        replyTo: email,
        subject: `Nuova richiesta dal sito — ${type === "contact" ? "Contatto" : "Appuntamento"} — ${firstName} ${lastName}`,
        html: `<table style="font-family:sans-serif;font-size:14px">${htmlRows}</table>`,
      });
      if (sendError) {
        console.error("[CRG] Errore invio email:", sendError.message);
      }
    } catch (err) {
      console.error("[CRG] Errore invio email:", err instanceof Error ? err.message : err);
    }
  } else {
    console.warn("[CRG] RESEND_API_KEY non configurata — email non inviata.");
  }

  return NextResponse.json(
    { success: true, message: "Richiesta ricevuta correttamente." },
    { status: 200 }
  );
}
