import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface AdminCommunicationListItem {
  id: string;
  slug: string;
  title: string;
  categoryName: string | null;
  isFeatured: boolean;
  publishStatus: string;
  publishedAt: string | null;
  updatedAt: string;
}

export async function getAdminCommunications(): Promise<AdminCommunicationListItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("communications")
    .select("id, slug, title, is_featured, publish_status, published_at, updated_at, category:communication_categories(name)")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as {
    id: string; slug: string; title: string; is_featured: boolean; publish_status: string;
    published_at: string | null; updated_at: string; category: { name: string } | null;
  }[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    categoryName: r.category?.name ?? null,
    isFeatured: r.is_featured,
    publishStatus: r.publish_status,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  }));
}

interface MediaRef {
  id: string;
  url: string;
  original_filename: string;
  kind: string;
}

export interface AdminCommunicationDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  categoryId: string | null;
  isFeatured: boolean;
  publishStatus: string;
  publishedAt: string | null;
  coverImage: MediaRef | null;
  attachments: { id: string; media: MediaRef | null }[];
}

export async function getAdminCommunicationById(id: string): Promise<AdminCommunicationDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("communications")
    .select(`
      id, slug, title, subtitle, excerpt, body, category_id, is_featured, publish_status, published_at,
      cover_media:media_library!cover_image_id(id, storage_path, bucket, original_filename, kind),
      communication_attachments(id, media:media_library(id, storage_path, bucket, original_filename, kind))
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string; slug: string; title: string; subtitle: string | null; excerpt: string | null;
    body: string; category_id: string | null; is_featured: boolean; publish_status: string; published_at: string | null;
    cover_media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
    communication_attachments: { id: string; media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null }[];
  };

  const toRef = (m: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null): MediaRef | null =>
    m ? { id: m.id, url: getPublicMediaUrl(m.storage_path, m.bucket), original_filename: m.original_filename, kind: m.kind } : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    excerpt: row.excerpt ?? "",
    body: row.body,
    categoryId: row.category_id,
    isFeatured: row.is_featured,
    publishStatus: row.publish_status,
    publishedAt: row.published_at,
    coverImage: toRef(row.cover_media),
    attachments: row.communication_attachments.map((a) => ({ id: a.id, media: toRef(a.media) })),
  };
}
