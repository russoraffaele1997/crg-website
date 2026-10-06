import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type LeadStatus = "new" | "contacted" | "visit_scheduled" | "closed";
export type LeadTypeValue = "contact" | "appointment" | "notify" | "document";

export interface AdminLead {
  id: string;
  type: LeadTypeValue;
  status: LeadStatus;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectId: string | null;
  projectTitle: string | null;
  unit: string | null;
  carBox: string | null;
  document: string | null;
  preferredDay: string | null;
  preferredTime: string | null;
  subject: string | null;
  message: string | null;
  notes: string;
}

interface LeadRow {
  id: string;
  type: LeadTypeValue;
  status: LeadStatus;
  created_at: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  project_id: string | null;
  preferred_day: string | null;
  preferred_time: string | null;
  subject: string | null;
  message: string | null;
  notes: string | null;
  project: { title: string } | null;
  unit: { name: string; unit_code: string } | null;
  car_box: { name: string } | null;
  document: { title: string } | null;
}

export async function listLeads(filters: { status?: string; projectId?: string; type?: string }): Promise<AdminLead[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("lead_submissions")
    .select(`
      id, type, status, created_at, first_name, last_name, email, phone, project_id,
      preferred_day, preferred_time, subject, message, notes,
      project:projects(title),
      unit:project_units(name, unit_code),
      car_box:project_car_boxes(name),
      document:project_documents(title)
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.type) query = query.eq("type", filters.type);

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as LeadRow[]).map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    createdAt: r.created_at,
    firstName: r.first_name,
    lastName: r.last_name ?? "",
    email: r.email,
    phone: r.phone ?? "",
    projectId: r.project_id,
    projectTitle: r.project?.title ?? null,
    unit: r.unit ? `${r.unit.name} (${r.unit.unit_code})` : null,
    carBox: r.car_box?.name ?? null,
    document: r.document?.title ?? null,
    preferredDay: r.preferred_day,
    preferredTime: r.preferred_time,
    subject: r.subject,
    message: r.message,
    notes: r.notes ?? "",
  }));
}

export async function countNewLeads(): Promise<number> {
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("lead_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");
  return count ?? 0;
}
