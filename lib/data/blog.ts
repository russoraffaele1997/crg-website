import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
}

export interface BlogTag {
  id: string;
  slug: string;
  name: string;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("blog_categories").select("id, slug, name").order("name");
  if (error || !data) return [];
  return data;
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("blog_tags").select("id, slug, name").order("name");
  if (error || !data) return [];
  return data;
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: BlogCategory | null;
  authorName: string | null;
  publishedAt: string | null;
  tags: BlogTag[];
}

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  cover_media: { storage_path: string; bucket: string } | null;
  category: { id: string; slug: string; name: string } | null;
  author: { full_name: string | null; email: string } | null;
  blog_post_tags: { tag: { id: string; slug: string; name: string } | null }[];
}

const LIST_SELECT = `
  id, slug, title, excerpt, published_at,
  cover_media:media_library!cover_image_id(storage_path, bucket),
  category:blog_categories(id, slug, name),
  author:admin_users!author_id(full_name, email),
  blog_post_tags(tag:blog_tags(id, slug, name))
`;

function mapListItem(row: PostRow): BlogPostListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_media ? getPublicMediaUrl(row.cover_media.storage_path, row.cover_media.bucket) : null,
    category: row.category,
    authorName: row.author?.full_name ?? row.author?.email ?? null,
    publishedAt: row.published_at,
    tags: row.blog_post_tags.map((t) => t.tag).filter((t): t is BlogTag => Boolean(t)),
  };
}

export async function getBlogPosts(
  params: { search?: string; categorySlug?: string; tagSlug?: string } = {}
): Promise<BlogPostListItem[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("blog_posts")
    .select(LIST_SELECT)
    .eq("publish_status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (params.search) query = query.ilike("title", `%${params.search}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  let items = (data as unknown as PostRow[]).map(mapListItem);
  if (params.categorySlug) items = items.filter((i) => i.category?.slug === params.categorySlug);
  if (params.tagSlug) items = items.filter((i) => i.tags.some((t) => t.slug === params.tagSlug));
  return items;
}

export interface BlogPostDetail extends BlogPostListItem {
  contentJson: Record<string, unknown>;
  gallery: string[];
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | undefined> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      ${LIST_SELECT},
      content_json,
      blog_gallery_images(order_index, media:media_library(storage_path, bucket)),
      seo_meta:seo_meta_id(meta_title, meta_description)
    `)
    .eq("slug", slug)
    .eq("publish_status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return undefined;

  const row = data as unknown as PostRow & {
    content_json: Record<string, unknown>;
    blog_gallery_images: { order_index: number; media: { storage_path: string; bucket: string } | null }[];
    seo_meta: { meta_title: string | null; meta_description: string | null } | null;
  };

  return {
    ...mapListItem(row),
    contentJson: row.content_json,
    gallery: [...row.blog_gallery_images]
      .sort((a, b) => a.order_index - b.order_index)
      .map((g) => (g.media ? getPublicMediaUrl(g.media.storage_path, g.media.bucket) : ""))
      .filter(Boolean),
    seoMetaTitle: row.seo_meta?.meta_title ?? null,
    seoMetaDescription: row.seo_meta?.meta_description ?? null,
  };
}

export async function getRelatedPosts(postId: string, categoryId: string | null, count = 3): Promise<BlogPostListItem[]> {
  const supabase = createServiceClient();

  // Manual override first
  const { data: manual } = await supabase
    .from("blog_related_posts")
    .select(`related:blog_posts!related_post_id(${LIST_SELECT})`)
    .eq("post_id", postId)
    .order("order_index", { ascending: true })
    .limit(count);

  const manualRows = (manual as unknown as { related: PostRow }[] | null)?.map((r) => r.related).filter(Boolean) ?? [];
  if (manualRows.length > 0) return manualRows.map(mapListItem);

  if (!categoryId) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(LIST_SELECT)
    .eq("publish_status", "published")
    .eq("category_id", categoryId)
    .neq("id", postId)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(count);

  if (error || !data) return [];
  return (data as unknown as PostRow[]).map(mapListItem);
}
