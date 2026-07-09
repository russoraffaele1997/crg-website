import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface CommunicationCategory {
  id: string;
  slug: string;
  name: string;
}

export async function getCommunicationCategories(): Promise<CommunicationCategory[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("communication_categories")
    .select("id, slug, name")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data;
}

export interface CommunicationListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  coverImage: string | null;
  category: CommunicationCategory | null;
  isFeatured: boolean;
  publishedAt: string | null;
}

interface CommunicationRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  is_featured: boolean;
  published_at: string | null;
  cover_media: { storage_path: string; bucket: string } | null;
  category: { id: string; slug: string; name: string } | null;
}

const LIST_SELECT = `
  id, slug, title, subtitle, excerpt, is_featured, published_at,
  cover_media:media_library!cover_image_id(storage_path, bucket),
  category:communication_categories(id, slug, name)
`;

function mapListItem(row: CommunicationRow): CommunicationListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    coverImage: row.cover_media ? getPublicMediaUrl(row.cover_media.storage_path, row.cover_media.bucket) : null,
    category: row.category,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
  };
}

export async function getCommunications(params: { search?: string; categorySlug?: string } = {}): Promise<CommunicationListItem[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("communications")
    .select(LIST_SELECT)
    .eq("publish_status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (params.search) query = query.ilike("title", `%${params.search}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  let items = (data as unknown as CommunicationRow[]).map(mapListItem);
  if (params.categorySlug) items = items.filter((i) => i.category?.slug === params.categorySlug);
  return items;
}

export async function getFeaturedCommunications(count = 3): Promise<CommunicationListItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("communications")
    .select(LIST_SELECT)
    .eq("publish_status", "published")
    .eq("is_featured", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(count);
  if (error || !data) return [];
  return (data as unknown as CommunicationRow[]).map(mapListItem);
}

export interface CommunicationDetail extends CommunicationListItem {
  body: string;
  attachments: { id: string; url: string; filename: string; kind: string }[];
}

export async function getCommunicationBySlug(slug: string): Promise<CommunicationDetail | undefined> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("communications")
    .select(`
      ${LIST_SELECT},
      body,
      communication_attachments(order_index, media:media_library(id, storage_path, bucket, original_filename, kind))
    `)
    .eq("slug", slug)
    .eq("publish_status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return undefined;

  const row = data as unknown as CommunicationRow & {
    body: string;
    communication_attachments: { order_index: number; media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null }[];
  };

  return {
    ...mapListItem(row),
    body: row.body,
    attachments: [...row.communication_attachments]
      .sort((a, b) => a.order_index - b.order_index)
      .filter((a) => a.media)
      .map((a) => ({
        id: a.media!.id,
        url: getPublicMediaUrl(a.media!.storage_path, a.media!.bucket),
        filename: a.media!.original_filename,
        kind: a.media!.kind,
      })),
  };
}
