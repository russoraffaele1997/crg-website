"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { requireRole, requireAdmin } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { upsertSeoMeta } from "@/lib/actions/seo";

function revalidatePublicSite() {
  revalidatePath("/", "layout");
}

function slugFromTitle(title: string) {
  return slugify(title, { lower: true, strict: true, locale: "it" });
}

export async function suggestBlogSlug(title: string) {
  await requireAdmin();
  return slugFromTitle(title);
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  /**
   * JSON-encoded string, not a plain object. Tiptap's JSONContent tree
   * (nested `attrs` objects on custom nodes) was silently losing those
   * `attrs` somewhere in Next.js's Server Action argument serialization —
   * passing it pre-stringified and JSON.parse()-ing server-side sidesteps
   * whatever that was and round-trips reliably.
   */
  contentJson: string;
  categoryId: string | null;
  authorId: string | null;
  tagIds: string[];
  coverImageId: string | null;
  publishStatus: "draft" | "published" | "archived";
  publishedAt: string | null;
  seoMetaTitle: string;
  seoMetaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

async function syncTags(postId: string, tagIds: string[]) {
  const service = createServiceClient();
  await service.from("blog_post_tags").delete().eq("post_id", postId);
  if (tagIds.length > 0) {
    await service.from("blog_post_tags").insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
  }
}

export async function createBlogPost(input: BlogPostInput): Promise<{ id: string }> {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const seoMetaId = await upsertSeoMeta(null, input);

  const { data, error } = await service
    .from("blog_posts")
    .insert({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      excerpt: input.excerpt || null,
      content_json: JSON.parse(input.contentJson),
      category_id: input.categoryId,
      author_id: input.authorId,
      cover_image_id: input.coverImageId,
      publish_status: input.publishStatus,
      published_at: input.publishedAt,
      seo_meta_id: seoMetaId,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Creazione articolo non riuscita.");

  await syncTags(data.id, input.tagIds);
  revalidatePublicSite();
  redirect(`/admin/blog/${data.id}`);
}

export async function updateBlogPost(id: string, input: BlogPostInput) {
  const admin = await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data: existing } = await service.from("blog_posts").select("*").eq("id", id).single();
  if (existing) {
    await service.from("content_revisions").insert({
      entity_type: "blog_post",
      entity_id: id,
      snapshot: existing,
      edited_by: admin.id,
    });
  }

  const seoMetaId = await upsertSeoMeta(existing?.seo_meta_id ?? null, input);

  const { error } = await service
    .from("blog_posts")
    .update({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      excerpt: input.excerpt || null,
      content_json: JSON.parse(input.contentJson),
      category_id: input.categoryId,
      author_id: input.authorId,
      cover_image_id: input.coverImageId,
      publish_status: input.publishStatus,
      published_at: input.publishedAt,
      seo_meta_id: seoMetaId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await syncTags(id, input.tagIds);
  revalidatePublicSite();
}

export async function deleteBlogPost(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
  redirect("/admin/blog");
}

export async function duplicateBlogPost(id: string): Promise<{ id: string }> {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data: original, error: fetchError } = await service.from("blog_posts").select("*").eq("id", id).single();
  if (fetchError || !original) throw new Error("Articolo non trovato.");

  const { data: originalTags } = await service.from("blog_post_tags").select("tag_id").eq("post_id", id);
  const { data: originalGallery } = await service.from("blog_gallery_images").select("media_id, order_index").eq("post_id", id);

  const { data, error } = await service
    .from("blog_posts")
    .insert({
      slug: `${original.slug}-copia-${Math.random().toString(36).slice(2, 8)}`,
      title: `${original.title} (copia)`,
      excerpt: original.excerpt,
      content_json: original.content_json,
      category_id: original.category_id,
      author_id: original.author_id,
      cover_image_id: original.cover_image_id,
      publish_status: "draft",
      published_at: null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Duplicazione non riuscita.");

  if (originalTags?.length) {
    await service.from("blog_post_tags").insert(originalTags.map((t) => ({ post_id: data.id, tag_id: t.tag_id })));
  }
  if (originalGallery?.length) {
    await service
      .from("blog_gallery_images")
      .insert(originalGallery.map((g) => ({ post_id: data.id, media_id: g.media_id, order_index: g.order_index })));
  }

  revalidatePublicSite();
  return { id: data.id };
}

// ─── Categories & Tags ──────────────────────────────────────────────────────

export async function createBlogCategory(name: string): Promise<{ id: string }> {
  await requireAdmin();
  const service = createServiceClient();
  const { data, error } = await service
    .from("blog_categories")
    .insert({ name, slug: slugFromTitle(name) })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Creazione categoria non riuscita.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function createBlogTag(name: string): Promise<{ id: string }> {
  await requireAdmin();
  const service = createServiceClient();
  const { data, error } = await service
    .from("blog_tags")
    .insert({ name, slug: slugFromTitle(name) })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Creazione tag non riuscita.");
  revalidatePublicSite();
  return { id: data.id };
}

// ─── Gallery ────────────────────────────────────────────────────────────────

export async function addBlogGalleryImage(postId: string, mediaId: string, orderIndex: number) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("blog_gallery_images").insert({ post_id: postId, media_id: mediaId, order_index: orderIndex });
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function removeBlogGalleryImage(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("blog_gallery_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

// ─── Revision history (shared content_revisions table) ─────────────────────

export interface PostRevisionSummary {
  id: string;
  editedAt: string;
  editedByName: string;
  snapshot: Record<string, unknown>;
}

export async function getBlogPostHistory(postId: string): Promise<PostRevisionSummary[]> {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { data } = await service
    .from("content_revisions")
    .select("id, snapshot, edited_at, admin_users(full_name, email)")
    .eq("entity_type", "blog_post")
    .eq("entity_id", postId)
    .order("edited_at", { ascending: false });

  return (data ?? []).map((r) => {
    const editor = r.admin_users as unknown as { full_name: string | null; email: string } | null;
    return {
      id: r.id,
      editedAt: r.edited_at,
      editedByName: editor?.full_name ?? editor?.email ?? "—",
      snapshot: r.snapshot as Record<string, unknown>,
    };
  });
}

export async function restoreBlogPostRevision(postId: string, revisionId: string) {
  const admin = await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { data: revision, error } = await service.from("content_revisions").select("snapshot").eq("id", revisionId).single();
  if (error || !revision) throw new Error("Versione non trovata.");

  const snapshot = revision.snapshot as Record<string, unknown>;

  const { data: existing } = await service.from("blog_posts").select("*").eq("id", postId).single();
  if (existing) {
    await service.from("content_revisions").insert({
      entity_type: "blog_post",
      entity_id: postId,
      snapshot: existing,
      edited_by: admin.id,
    });
  }

  await service
    .from("blog_posts")
    .update({
      title: snapshot.title,
      excerpt: snapshot.excerpt,
      content_json: snapshot.content_json,
      category_id: snapshot.category_id,
      author_id: snapshot.author_id,
      cover_image_id: snapshot.cover_image_id,
      publish_status: snapshot.publish_status,
      published_at: snapshot.published_at,
    })
    .eq("id", postId);

  revalidatePublicSite();
}
