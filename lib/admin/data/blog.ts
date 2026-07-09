import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface AdminBlogPostListItem {
  id: string;
  slug: string;
  title: string;
  categoryName: string | null;
  authorName: string | null;
  publishStatus: string;
  publishedAt: string | null;
  updatedAt: string;
}

export async function getAdminBlogPosts(): Promise<AdminBlogPostListItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, publish_status, published_at, updated_at, category:blog_categories(name), author:admin_users!author_id(full_name, email)")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as {
    id: string; slug: string; title: string; publish_status: string; published_at: string | null; updated_at: string;
    category: { name: string } | null; author: { full_name: string | null; email: string } | null;
  }[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    categoryName: r.category?.name ?? null,
    authorName: r.author?.full_name ?? r.author?.email ?? null,
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

export interface AdminBlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentJson: Record<string, unknown>;
  categoryId: string | null;
  authorId: string | null;
  publishStatus: string;
  publishedAt: string | null;
  coverImage: MediaRef | null;
  tagIds: string[];
  gallery: { id: string; media: MediaRef | null }[];
  seoMetaId: string | null;
  seoMetaTitle: string;
  seoMetaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

export async function getAdminBlogPostById(id: string): Promise<AdminBlogPostDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, slug, title, excerpt, content_json, category_id, author_id, publish_status, published_at, seo_meta_id,
      cover_media:media_library!cover_image_id(id, storage_path, bucket, original_filename, kind),
      blog_post_tags(tag_id),
      blog_gallery_images(id, media:media_library(id, storage_path, bucket, original_filename, kind)),
      seo_meta:seo_meta_id(meta_title, meta_description, og_title, og_description)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string; slug: string; title: string; excerpt: string | null; content_json: Record<string, unknown>;
    category_id: string | null; author_id: string | null; publish_status: string; published_at: string | null;
    seo_meta_id: string | null;
    cover_media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
    blog_post_tags: { tag_id: string }[];
    blog_gallery_images: { id: string; media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null }[];
    seo_meta: { meta_title: string | null; meta_description: string | null; og_title: string | null; og_description: string | null } | null;
  };

  const toRef = (m: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null): MediaRef | null =>
    m ? { id: m.id, url: getPublicMediaUrl(m.storage_path, m.bucket), original_filename: m.original_filename, kind: m.kind } : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    contentJson: row.content_json ?? {},
    categoryId: row.category_id,
    authorId: row.author_id,
    publishStatus: row.publish_status,
    publishedAt: row.published_at,
    coverImage: toRef(row.cover_media),
    tagIds: row.blog_post_tags.map((t) => t.tag_id),
    gallery: row.blog_gallery_images.map((g) => ({ id: g.id, media: toRef(g.media) })),
    seoMetaId: row.seo_meta_id,
    seoMetaTitle: row.seo_meta?.meta_title ?? "",
    seoMetaDescription: row.seo_meta?.meta_description ?? "",
    ogTitle: row.seo_meta?.og_title ?? "",
    ogDescription: row.seo_meta?.og_description ?? "",
  };
}

export interface AdminAuthorOption {
  id: string;
  name: string;
}

export async function getAdminAuthors(): Promise<AdminAuthorOption[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("admin_users").select("id, full_name, email").eq("is_active", true);
  if (error || !data) return [];
  return data.map((u) => ({ id: u.id, name: u.full_name ?? u.email }));
}
