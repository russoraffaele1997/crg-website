"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { upsertSeoMeta, type SeoFieldsInput } from "@/lib/actions/seo";

export interface PageSeoInput extends SeoFieldsInput {
  pagePath: string;
}

export async function savePageSeo(input: PageSeoInput) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data: existing } = await service
    .from("page_seo")
    .select("id, seo_meta_id")
    .eq("page_path", input.pagePath)
    .maybeSingle();

  const seoMetaId = await upsertSeoMeta(existing?.seo_meta_id ?? null, input);

  const { error } = await service
    .from("page_seo")
    .upsert({ page_path: input.pagePath, seo_meta_id: seoMetaId }, { onConflict: "page_path" });

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
