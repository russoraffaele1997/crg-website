import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export interface SeoFieldsInput {
  seoMetaTitle: string;
  seoMetaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl?: string;
  twitterCard?: string;
}

/**
 * Shared by every entity that carries an optional seo_meta_id FK (projects,
 * communications, blog posts) plus page_seo (static pages). Creates the
 * seo_meta row on first save, updates it thereafter. Returns null (leaving
 * the FK unset) if every field is empty, so entities that never touch SEO
 * don't accumulate empty seo_meta rows.
 */
export async function upsertSeoMeta(existingSeoMetaId: string | null, input: SeoFieldsInput): Promise<string | null> {
  const hasAnyValue =
    input.seoMetaTitle || input.seoMetaDescription || input.ogTitle || input.ogDescription || input.canonicalUrl;
  // Only skip the write when there's nothing to save AND nothing to clear —
  // an entity that has never touched SEO shouldn't accumulate an empty
  // seo_meta row. Once a row exists, always write through so the fields can
  // be cleared back to empty from the form.
  if (!hasAnyValue && !existingSeoMetaId) return null;

  const service = createServiceClient();
  const payload = {
    meta_title: input.seoMetaTitle || null,
    meta_description: input.seoMetaDescription || null,
    og_title: input.ogTitle || null,
    og_description: input.ogDescription || null,
    canonical_url: input.canonicalUrl || null,
    twitter_card: input.twitterCard || "summary_large_image",
  };

  if (existingSeoMetaId) {
    await service.from("seo_meta").update(payload).eq("id", existingSeoMetaId);
    return existingSeoMetaId;
  }

  const { data, error } = await service.from("seo_meta").insert(payload).select("id").single();
  if (error || !data) return null;
  return data.id;
}
