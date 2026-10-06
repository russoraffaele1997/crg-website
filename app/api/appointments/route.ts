import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createServiceClient } from "@/lib/supabase/service";
import { downloadStoredFile, resolveLeadContext } from "@/lib/leads/server";
import type { LeadType } from "@/lib/leads/client";

const LEADS_EMAIL = "clienti@crgcostruzioni.it";
const A4: [number, number] = [595.28, 841.89];
const MARGIN = 50;

const LEAD_TYPES: LeadType[] = ["contact", "appointment", "notify", "document"];

const TYPE_LABELS: Record<LeadType, string> = {
  contact: "Contatto",
  appointment: "Appuntamento",
  notify: "Iscrizione aggiornamenti progetto",
  document: "Richiesta documento",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Mattina (09:00 – 12:00)",
  afternoon: "Pomeriggio (14:00 – 17:00)",
  evening: "Tardo pomeriggio (17:00 – 19:00)",
};

/** Only identifiers and what the visitor typed: everything else is looked up server-side. */
interface AppointmentPayload {
  type?: LeadType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  projectId?: string;
  unitCode?: string;
  carBoxId?: string;
  documentId?: string;
  preferredDay?: string;
  preferredTime?: string;
  subject?: string;
  message?: string;
  privacy?: boolean;
}

/** Trims and caps free text so a single request can't flood the inbox or the database. */
function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// pdf-lib's built-in fonts only support WinAnsi encoding — strip anything
// outside that range (emoji, curly quotes copy-pasted into a free-text
// message, etc.) instead of letting the whole PDF generation throw.
function pdfSafe(text: string): string {
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

async function generateSummaryPdf(data: {
  type: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  projectTitle?: string;
  unitDetails?: string;
  carBoxDetails?: string;
  preferredDay?: string;
  preferredTime?: string;
  message?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage(A4);
  let y = page.getHeight() - MARGIN;

  const newPageIfNeeded = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage(A4);
      y = page.getHeight() - MARGIN;
    }
  };

  const drawHeading = (text: string, size: number, color = rgb(0.1, 0.1, 0.1)) => {
    newPageIfNeeded(size + 10);
    page.drawText(pdfSafe(text), { x: MARGIN, y, size, font: boldFont, color });
    y -= size + 10;
  };

  const drawLine = (text: string) => {
    const maxWidth = page.getWidth() - MARGIN * 2;
    const words = pdfSafe(text).split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, 11) > maxWidth && line) {
        newPageIfNeeded(16);
        page.drawText(line, { x: MARGIN, y, size: 11, font, color: rgb(0.25, 0.25, 0.25) });
        y -= 16;
        line = word;
      } else {
        line = testLine;
      }
    }
    newPageIfNeeded(16);
    page.drawText(line, { x: MARGIN, y, size: 11, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 16;
  };

  const drawSpacer = (amount = 10) => {
    y -= amount;
  };

  drawHeading("Riepilogo richiesta — CRG", 20, rgb(0.78, 0.06, 0.18));
  drawLine(`Tipo: ${TYPE_LABELS[data.type as LeadType] ?? data.type}`);
  drawLine(`Data invio: ${new Date().toLocaleString("it-IT")}`);
  drawSpacer(18);

  drawHeading("Dati cliente", 13);
  drawLine(`Nome e cognome: ${data.firstName} ${data.lastName ?? ""}`.trim());
  drawLine(`Email: ${data.email}`);
  if (data.phone) drawLine(`Telefono: ${data.phone}`);
  drawSpacer(18);

  if (data.projectTitle) {
    drawHeading("Progetto", 13);
    drawLine(data.projectTitle);
    drawSpacer(18);
  }

  if (data.unitDetails) {
    drawHeading("Appartamento scelto", 13);
    data.unitDetails.split("\n").forEach(drawLine);
    drawSpacer(18);
  }

  if (data.carBoxDetails) {
    drawHeading("Box auto scelto", 13);
    drawLine(data.carBoxDetails);
    drawSpacer(18);
  }

  if (data.preferredDay || data.preferredTime) {
    drawHeading("Preferenze appuntamento", 13);
    if (data.preferredDay) drawLine(`Giorno preferito: ${data.preferredDay}`);
    if (data.preferredTime) drawLine(`Fascia oraria: ${data.preferredTime}`);
    drawSpacer(18);
  }

  if (data.message) {
    drawHeading("Messaggio", 13);
    data.message.split("\n").forEach(drawLine);
  }

  return doc.save();
}


export async function POST(request: NextRequest) {
  let body: AppointmentPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const type: LeadType = LEAD_TYPES.includes(body.type as LeadType) ? (body.type as LeadType) : "appointment";
  const firstName = clean(body.firstName, 100);
  const lastName = clean(body.lastName, 100);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const subject = clean(body.subject, 200);
  const message = clean(body.message, 5000);
  const preferredDay = /^\d{4}-\d{2}-\d{2}$/.test(body.preferredDay ?? "") ? body.preferredDay! : "";
  const preferredTime = TIME_LABELS[body.preferredTime ?? ""] ? body.preferredTime! : "";
  // Sign-ups and document requests only ask for a first name.
  const needsLastName = type === "contact" || type === "appointment";

  // Server-side validation
  if (!firstName) {
    return NextResponse.json({ error: "Il nome è obbligatorio." }, { status: 422 });
  }
  if (needsLastName && !lastName) {
    return NextResponse.json({ error: "Il cognome è obbligatorio." }, { status: 422 });
  }
  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: "Email non valida." }, { status: 422 });
  }
  if (body.privacy !== true) {
    return NextResponse.json({ error: "Il consenso alla privacy è obbligatorio." }, { status: 422 });
  }

  const ctx = await resolveLeadContext({
    projectId: body.projectId,
    unitCode: body.unitCode,
    carBoxId: body.carBoxId,
    documentId: body.documentId,
  });

  if ((type === "notify" || type === "document") && !ctx.project) {
    return NextResponse.json({ error: "Progetto non trovato." }, { status: 422 });
  }
  if (type === "document" && !ctx.document) {
    return NextResponse.json({ error: "Documento non disponibile al momento. Contattaci." }, { status: 422 });
  }

  // ─── Persist the lead ───────────────────────────────────────────────────
  const service = createServiceClient();
  const { error: insertError } = await service.from("lead_submissions").insert({
    type,
    first_name: firstName,
    last_name: lastName || null,
    email,
    phone: phone || null,
    project_id: ctx.project?.id ?? null,
    unit_id: ctx.unit?.id ?? null,
    car_box_id: ctx.carBox?.id ?? null,
    document_id: ctx.document?.id ?? null,
    preferred_day: preferredDay || null,
    preferred_time: preferredTime || null,
    subject: subject || null,
    message: message || null,
    privacy_accepted: true,
  });

  if (insertError) {
    console.error("[CRG] Errore salvataggio richiesta:", insertError.message);
  }

  // ─── Send the notification email ───────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fullName = `${firstName} ${lastName}`.trim();
      const rows: [string, string | undefined][] = [
        ["Tipo", TYPE_LABELS[type]],
        ["Nome", fullName],
        ["Email", email],
        ["Telefono", phone],
        ["Progetto", ctx.project?.title],
        ["Unità di interesse", ctx.unit?.details],
        ["Box auto", ctx.carBox?.details],
        ["Documento richiesto", ctx.document?.title],
        ["Giorno preferito", preferredDay],
        ["Fascia oraria", TIME_LABELS[preferredTime]],
        ["Oggetto", subject],
        ["Messaggio", message],
      ];
      const htmlRows = rows
        .filter(([, value]) => value)
        .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;white-space:nowrap">${label}</td><td style="padding:4px 0">${escapeHtml(String(value)).replace(/\n/g, "<br>")}</td></tr>`)
        .join("");

      // Sign-ups and document requests are short: no PDF, no floorplans.
      const withAttachments = type === "contact" || type === "appointment";
      const attachments: { filename: string; content: Buffer }[] = [];
      if (withAttachments) {
        const summaryPdfBytes = await generateSummaryPdf({
          type,
          firstName,
          lastName,
          email,
          phone,
          projectTitle: ctx.project?.title,
          unitDetails: ctx.unit?.details,
          carBoxDetails: ctx.carBox?.details,
          preferredDay,
          preferredTime: TIME_LABELS[preferredTime],
          message,
        });
        attachments.push({ filename: "riepilogo-richiesta.pdf", content: Buffer.from(summaryPdfBytes) });
        const floorplans = await Promise.all((ctx.unit?.floorplans ?? []).map(downloadStoredFile));
        attachments.push(...floorplans.filter((a): a is { filename: string; content: Buffer } => a !== null));
      }

      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "CRG Website <onboarding@resend.dev>",
        to: LEADS_EMAIL,
        replyTo: email,
        subject: `Nuova richiesta dal sito — ${TYPE_LABELS[type]} — ${fullName}`,
        html: `<table style="font-family:sans-serif;font-size:14px">${htmlRows}</table>`,
        attachments,
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
    {
      success: true,
      message: "Richiesta ricevuta correttamente.",
      ...(type === "document" && ctx.document ? { documentUrl: ctx.document.url } : {}),
    },
    { status: 200 }
  );
}
