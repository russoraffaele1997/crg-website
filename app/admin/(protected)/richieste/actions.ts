"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import type { LeadStatus } from "@/lib/admin/data/leads";

const STATUSES: LeadStatus[] = ["new", "contacted", "visit_scheduled", "closed"];

export async function updateLead(id: string, changes: { status?: LeadStatus; notes?: string }) {
  await requireAdmin();
  const update: { status?: LeadStatus; notes?: string | null } = {};
  if (changes.status) {
    if (!STATUSES.includes(changes.status)) throw new Error("Stato non valido.");
    update.status = changes.status;
  }
  if (changes.notes !== undefined) update.notes = changes.notes.trim().slice(0, 5000) || null;

  const service = createServiceClient();
  const { error } = await service.from("lead_submissions").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
