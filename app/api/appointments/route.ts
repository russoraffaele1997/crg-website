import { NextRequest, NextResponse } from "next/server";

interface AppointmentPayload {
  type?: "contact" | "appointment";
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  projectId?: string;
  projectTitle?: string;
  unitId?: string;
  preferredDay?: string;
  preferredTime?: string;
  subject?: string;
  message?: string;
  privacy?: boolean;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  // ─── Log the request ───────────────────────────────────────────────────────
  // In produzione: collegare a email (Nodemailer/Resend), CRM (HubSpot/Pipedrive),
  // database (Prisma/Drizzle) o webhook esterno.
  console.log("[CRG] Nuova richiesta ricevuta:", {
    type: body.type ?? "appointment",
    name: `${firstName} ${lastName}`,
    email,
    phone: body.phone,
    projectId: body.projectId,
    projectTitle: body.projectTitle,
    unitId: body.unitId,
    preferredDay: body.preferredDay,
    preferredTime: body.preferredTime,
    subject: body.subject,
    message: body.message,
    timestamp: new Date().toISOString(),
  });

  // ─── Future integration points ─────────────────────────────────────────────
  // await sendEmailNotification(body);      // es. Resend / Nodemailer
  // await saveToCRM(body);                  // es. HubSpot API
  // await saveToDatabase(body);             // es. Prisma + PostgreSQL

  return NextResponse.json(
    { success: true, message: "Richiesta ricevuta correttamente." },
    { status: 200 }
  );
}
