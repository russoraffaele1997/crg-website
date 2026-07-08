"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { getBlockDefinition } from "@/lib/content/block-registry";

export async function saveBlock(page: string, blockKey: string, data: Record<string, unknown>) {
  const admin = await requireRole(["super_admin", "editor"]);
  const def = getBlockDefinition(page, blockKey);
  if (!def) throw new Error("Blocco di contenuto non riconosciuto.");

  const service = createServiceClient();
  const { data: existing } = await service
    .from("site_content_blocks")
    .select("id, data")
    .eq("page", page)
    .eq("block_key", blockKey)
    .maybeSingle();

  if (existing) {
    // Snapshot the pre-update state before writing over it — append-only
    // history, never a destructive rewrite.
    await service.from("content_revisions").insert({
      entity_type: "site_content_block",
      entity_id: existing.id,
      snapshot: existing.data,
      edited_by: admin.id,
    });

    const { error } = await service
      .from("site_content_blocks")
      .update({ data, updated_by: admin.id })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await service.from("site_content_blocks").insert({
      page,
      block_key: blockKey,
      data,
      updated_by: admin.id,
      publish_status: "published",
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/", "layout");
}

export interface BlockRevisionSummary {
  id: string;
  snapshot: Record<string, unknown>;
  editedAt: string;
  editedByName: string;
}

export async function getBlockHistory(page: string, blockKey: string): Promise<BlockRevisionSummary[]> {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data: block } = await service
    .from("site_content_blocks")
    .select("id")
    .eq("page", page)
    .eq("block_key", blockKey)
    .maybeSingle();
  if (!block) return [];

  const { data } = await service
    .from("content_revisions")
    .select("id, snapshot, edited_at, admin_users(full_name, email)")
    .eq("entity_type", "site_content_block")
    .eq("entity_id", block.id)
    .order("edited_at", { ascending: false });

  return (data ?? []).map((r) => {
    const editor = r.admin_users as unknown as { full_name: string | null; email: string } | null;
    return {
      id: r.id,
      snapshot: r.snapshot as Record<string, unknown>,
      editedAt: r.edited_at,
      editedByName: editor?.full_name ?? editor?.email ?? "—",
    };
  });
}

export async function restoreBlockRevision(page: string, blockKey: string, revisionId: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { data: revision, error } = await service
    .from("content_revisions")
    .select("snapshot")
    .eq("id", revisionId)
    .single();
  if (error || !revision) throw new Error("Versione non trovata.");

  await saveBlock(page, blockKey, revision.snapshot as Record<string, unknown>);
}
