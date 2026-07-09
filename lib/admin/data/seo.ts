import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { staticPages } from "@/lib/seo/static-pages";

export interface AdminPageSeoSummary {
  key: string;
  path: string;
  label: string;
  configured: boolean;
}

export async function listAdminPageSeo(): Promise<AdminPageSeoSummary[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("page_seo").select("page_path").not("seo_meta_id", "is", null);
  const configuredPaths = new Set((data ?? []).map((r) => r.page_path));
  return staticPages.map((p) => ({ key: p.key, path: p.path, label: p.label, configured: configuredPaths.has(p.path) }));
}

export interface AdminPageSeoDetail {
  seoMetaId: string | null;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: string;
}

export async function getAdminPageSeo(pagePath: string): Promise<AdminPageSeoDetail> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("page_seo")
    .select("seo_meta_id, seo_meta:seo_meta_id(meta_title, meta_description, canonical_url, og_title, og_description, twitter_card)")
    .eq("page_path", pagePath)
    .maybeSingle();

  const seo = data?.seo_meta as unknown as {
    meta_title: string | null; meta_description: string | null; canonical_url: string | null;
    og_title: string | null; og_description: string | null; twitter_card: string | null;
  } | null;

  return {
    seoMetaId: data?.seo_meta_id ?? null,
    metaTitle: seo?.meta_title ?? "",
    metaDescription: seo?.meta_description ?? "",
    canonicalUrl: seo?.canonical_url ?? "",
    ogTitle: seo?.og_title ?? "",
    ogDescription: seo?.og_description ?? "",
    twitterCard: seo?.twitter_card ?? "summary_large_image",
  };
}
