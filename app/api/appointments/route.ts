import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createServiceClient } from "@/lib/supabase/service";

const LEADS_EMAIL = "clienti@crgcostruzioni.it";
const A4: [number, number] = [595.28, 841.89];
const MARGIN = 50;

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
  floorplanFiles?: { url: string; filename: string }[];
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

// pdf-lib's built-in fonts only support WinAnsi encoding — strip anything
// outside that range (emoji, curly quotes copy-pasted into a free-text
// message, etc.) instead of letting the whole PDF generation throw.
function pdfSafe(text: string): string {
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

async function generateSummaryPdf(data: {
  type: string;
  firstName: string;
  lastName: string;
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
  drawLine(`Tipo: ${data.type === "contact" ? "Contatto" : "Appuntamento"}`);
  drawLine(`Data invio: ${new Date().toLocaleString("it-IT")}`);
  drawSpacer(18);

  drawHeading("Dati cliente", 13);
  drawLine(`Nome e cognome: ${data.firstName} ${data.lastName}`);
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

async function fetchAsAttachment(url: string, filename: string): Promise<{ filename: string; content: Buffer } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return { filename, content: Buffer.from(arrayBuffer) };
  } catch {
    return null;
  }
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

      const summaryPdfBytes = await generateSummaryPdf({
        type,
        firstName,
        lastName,
        email,
        phone: body.phone,
        projectTitle: body.projectTitle,
        unitDetails: body.unitDetails,
        carBoxDetails: body.carBoxDetails,
        preferredDay: body.preferredDay,
        preferredTime: body.preferredTime,
        message: body.message,
      });

      const floorplanAttachments = body.floorplanFiles?.length
        ? (await Promise.all(body.floorplanFiles.map((f) => fetchAsAttachment(f.url, f.filename)))).filter(
            (a): a is { filename: string; content: Buffer } => a !== null
          )
        : [];

      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "CRG Website <onboarding@resend.dev>",
        to: LEADS_EMAIL,
        replyTo: email,
        subject: `Nuova richiesta dal sito — ${type === "contact" ? "Contatto" : "Appuntamento"} — ${firstName} ${lastName}`,
        html: `<table style="font-family:sans-serif;font-size:14px">${htmlRows}</table>`,
        attachments: [
          { filename: "riepilogo-richiesta.pdf", content: Buffer.from(summaryPdfBytes) },
          ...floorplanAttachments,
        ],
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
