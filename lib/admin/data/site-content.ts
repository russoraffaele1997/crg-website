import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { blockDefinitions, getBlockDefinition } from "@/lib/content/block-registry";

export interface AdminBlockSummary {
  page: string;
  blockKey: string;
  pageLabel: string;
  blockLabel: string;
  updatedAt: string | null;
}

export async function listAdminBlocks(): Promise<AdminBlockSummary[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("site_content_blocks").select("page, block_key, updated_at");
  const rows = new Map((data ?? []).map((r) => [`${r.page}:${r.block_key}`, r.updated_at as string]));

  return blockDefinitions.map((def) => ({
    page: def.page,
    blockKey: def.blockKey,
    pageLabel: def.pageLabel,
    blockLabel: def.blockLabel,
    updatedAt: rows.get(`${def.page}:${def.blockKey}`) ?? null,
  }));
}

export interface AdminBlock {
  id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export async function getAdminBlock(page: string, blockKey: string): Promise<AdminBlock> {
  const def = getBlockDefinition(page, blockKey);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("site_content_blocks")
    .select("id, data")
    .eq("page", page)
    .eq("block_key", blockKey)
    .maybeSingle();

  if (data) return { id: data.id, data: { ...(def?.defaultData ?? {}), ...data.data } };
  return { id: null, data: def?.defaultData ?? {} };
}
