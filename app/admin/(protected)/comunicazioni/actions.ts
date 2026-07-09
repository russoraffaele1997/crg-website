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

export async function suggestCommunicationSlug(title: string) {
  await requireAdmin();
  return slugFromTitle(title);
}

export interface CommunicationInput {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  categoryId: string | null;
  coverImageId: string | null;
  isFeatured: boolean;
  publishStatus: "draft" | "published" | "archived";
  publishedAt: string | null; // ISO — null when draft, "now" or future when published
  seoMetaTitle: string;
  seoMetaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

export async function createCommunication(input: CommunicationInput): Promise<{ id: string }> {
  const admin = await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const seoMetaId = await upsertSeoMeta(null, input);

  const { data, error } = await service
    .from("communications")
    .insert({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      subtitle: input.subtitle || null,
      excerpt: input.excerpt || null,
      body: input.body,
      category_id: input.categoryId,
      cover_image_id: input.coverImageId,
      is_featured: input.isFeatured,
      publish_status: input.publishStatus,
      published_at: input.publishedAt,
      seo_meta_id: seoMetaId,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Creazione comunicazione non riuscita.");

  revalidatePublicSite();
  redirect(`/admin/comunicazioni/${data.id}`);
}

export async function updateCommunication(id: string, input: CommunicationInput) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data: existing } = await service.from("communications").select("seo_meta_id").eq("id", id).single();
  const seoMetaId = await upsertSeoMeta(existing?.seo_meta_id ?? null, input);

  const { error } = await service
    .from("communications")
    .update({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      subtitle: input.subtitle || null,
      excerpt: input.excerpt || null,
      body: input.body,
      category_id: input.categoryId,
      cover_image_id: input.coverImageId,
      is_featured: input.isFeatured,
      publish_status: input.publishStatus,
      published_at: input.publishedAt,
      seo_meta_id: seoMetaId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteCommunication(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("communications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
  redirect("/admin/comunicazioni");
}

export async function duplicateCommunication(id: string): Promise<{ id: string }> {
  const admin = await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data: original, error: fetchError } = await service
    .from("communications")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !original) throw new Error("Comunicazione non trovata.");

  const { data, error } = await service
    .from("communications")
    .insert({
      slug: `${original.slug}-copia-${Math.random().toString(36).slice(2, 8)}`,
      title: `${original.title} (copia)`,
      subtitle: original.subtitle,
      excerpt: original.excerpt,
      body: original.body,
      category_id: original.category_id,
      cover_image_id: original.cover_image_id,
      is_featured: false,
      publish_status: "draft",
      published_at: null,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Duplicazione non riuscita.");

  // Copy attachments too
  const { data: attachments } = await service
    .from("communication_attachments")
    .select("media_id, order_index")
    .eq("communication_id", id);
  if (attachments?.length) {
    await service.from("communication_attachments").insert(
      attachments.map((a) => ({ communication_id: data.id, media_id: a.media_id, order_index: a.order_index }))
    );
  }

  revalidatePublicSite();
  return { id: data.id };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function createCommunicationCategory(name: string): Promise<{ id: string }> {
  await requireAdmin();
  const service = createServiceClient();
  const { data, error } = await service
    .from("communication_categories")
    .insert({ name, slug: slugFromTitle(name) })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Creazione categoria non riuscita.");
  revalidatePublicSite();
  return { id: data.id };
}

// ─── Attachments ────────────────────────────────────────────────────────────

export async function addCommunicationAttachment(communicationId: string, mediaId: string, orderIndex: number) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service
    .from("communication_attachments")
    .insert({ communication_id: communicationId, media_id: mediaId, order_index: orderIndex });
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function removeCommunicationAttachment(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("communication_attachments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}
