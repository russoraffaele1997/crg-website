import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface PageSeo {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
}

export async function getPageSeo(pagePath: string): Promise<PageSeo | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("page_seo")
    .select("seo_meta:seo_meta_id(meta_title, meta_description, canonical_url, og_title, og_description, twitter_card, og_image:media_library(storage_path, bucket))")
    .eq("page_path", pagePath)
    .maybeSingle();

  if (error || !data?.seo_meta) return null;

  const seo = data.seo_meta as unknown as {
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    twitter_card: string | null;
    og_image: { storage_path: string; bucket: string } | null;
  };

  return {
    metaTitle: seo.meta_title,
    metaDescription: seo.meta_description,
    canonicalUrl: seo.canonical_url,
    ogTitle: seo.og_title,
    ogDescription: seo.og_description,
    ogImage: seo.og_image ? getPublicMediaUrl(seo.og_image.storage_path, seo.og_image.bucket) : null,
    twitterCard: seo.twitter_card,
  };
}

/**
 * Same shape as getPageSeo but for slug-addressed entities (projects,
 * communications, blog posts) that carry their own seo_meta_id FK rather
 * than going through page_seo.
 */
export async function getEntitySeoBySlug(
  table: "projects" | "communications" | "blog_posts",
  slug: string
): Promise<PageSeo | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(table)
    .select("seo_meta:seo_meta_id(meta_title, meta_description, canonical_url, og_title, og_description, twitter_card, og_image:media_library(storage_path, bucket))")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data?.seo_meta) return null;

  const seo = data.seo_meta as unknown as {
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    twitter_card: string | null;
    og_image: { storage_path: string; bucket: string } | null;
  };

  return {
    metaTitle: seo.meta_title,
    metaDescription: seo.meta_description,
    canonicalUrl: seo.canonical_url,
    ogTitle: seo.og_title,
    ogDescription: seo.og_description,
    ogImage: seo.og_image ? getPublicMediaUrl(seo.og_image.storage_path, seo.og_image.bucket) : null,
    twitterCard: seo.twitter_card,
  };
}
