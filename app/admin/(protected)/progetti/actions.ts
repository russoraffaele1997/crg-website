"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { requireRole, requireAdmin } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { getUnitDocuments } from "@/lib/admin/data/units";
import type { ProjectCategory, ProjectStatus, UnitStatus } from "@/lib/types/project";

function revalidatePublicSite() {
  // Projects surface on the homepage (featured), the listing, each detail
  // page, and the Header/Footer project dropdown/list on every page — so a
  // single layout-level revalidation is simpler and safer than tracking
  // every affected path individually.
  revalidatePath("/", "layout");
}

export interface ProjectGeneralInput {
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  status: ProjectStatus;
  statusLabel: string;
  shortDescription: string;
  description: string;
  coverImageId: string | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  publishStatus: "draft" | "published" | "archived";
}

function slugFromTitle(title: string) {
  return slugify(title, { lower: true, strict: true, locale: "it" });
}

export async function suggestProjectSlug(title: string) {
  await requireAdmin();
  return slugFromTitle(title);
}

export async function createProject(input: ProjectGeneralInput): Promise<{ id: string }> {
  const admin = await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data, error } = await service
    .from("projects")
    .insert({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      location: input.location,
      category: input.category,
      status: input.status,
      status_label: input.statusLabel,
      short_description: input.shortDescription,
      description: input.description,
      cover_image_id: input.coverImageId,
      is_featured: input.isFeatured,
      featured_order: input.featuredOrder,
      publish_status: input.publishStatus,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Creazione progetto non riuscita.");
  }

  revalidatePublicSite();
  redirect(`/admin/progetti/${data.id}`);
}

export async function updateProjectGeneral(id: string, input: ProjectGeneralInput) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { error } = await service
    .from("projects")
    .update({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      location: input.location,
      category: input.category,
      status: input.status,
      status_label: input.statusLabel,
      short_description: input.shortDescription,
      description: input.description,
      cover_image_id: input.coverImageId,
      is_featured: input.isFeatured,
      featured_order: input.featuredOrder,
      publish_status: input.publishStatus,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteProject(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
  redirect("/admin/progetti");
}

// ─── Gallery ──────────────────────────────────────────────────────────────

export async function addGalleryImage(projectId: string, mediaId: string, orderIndex: number) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service
    .from("project_gallery_images")
    .insert({ project_id: projectId, media_id: mediaId, order_index: orderIndex });
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function removeGalleryImage(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_gallery_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderGalleryImages(orderedIds: string[]) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      service.from("project_gallery_images").update({ order_index: index }).eq("id", id)
    )
  );
  revalidatePublicSite();
}

// ─── Features (highlights + technical) ─────────────────────────────────────

export async function addFeature(projectId: string, kind: "highlight" | "technical", title: string, orderIndex: number) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service
    .from("project_features")
    .insert({ project_id: projectId, kind, title, order_index: orderIndex });
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function updateFeature(id: string, title: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_features").update({ title }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteFeature(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_features").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderFeatures(orderedIds: string[]) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) => service.from("project_features").update({ order_index: index }).eq("id", id))
  );
  revalidatePublicSite();
}

// ─── Units ──────────────────────────────────────────────────────────────────

export interface UnitInput {
  unitCode: string;
  name: string;
  typology: string;
  floor: string;
  interno: string;
  sqm: number;
  outdoorSqm: number | null;
  rooms: string;
  destination: string;
  price: string;
  status: UnitStatus;
}

async function syncTotalUnits(projectId: string) {
  const service = createServiceClient();
  const { count } = await service
    .from("project_units")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);
  await service.from("projects").update({ total_units: count ?? 0 }).eq("id", projectId);
}

export async function createUnit(projectId: string, input: UnitInput, orderIndex: number) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_units").insert({
    project_id: projectId,
    unit_code: input.unitCode,
    name: input.name,
    typology: input.typology,
    floor: input.floor || null,
    interno: input.interno || null,
    sqm: input.sqm,
    outdoor_sqm: input.outdoorSqm,
    rooms: input.rooms || null,
    destination: input.destination || null,
    price: input.price || null,
    status: input.status,
    order_index: orderIndex,
  });
  if (error) throw new Error(error.message);
  await syncTotalUnits(projectId);
  revalidatePublicSite();
}

export async function updateUnit(id: string, projectId: string, input: UnitInput) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service
    .from("project_units")
    .update({
      unit_code: input.unitCode,
      name: input.name,
      typology: input.typology,
      floor: input.floor || null,
      interno: input.interno || null,
      sqm: input.sqm,
      outdoor_sqm: input.outdoorSqm,
      rooms: input.rooms || null,
      destination: input.destination || null,
      price: input.price || null,
      status: input.status,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
  void projectId;
}

/**
 * The single most important write in the whole CMS per the client's brief:
 * "when I sell an apartment, I just want to change its status." Kept as its
 * own tiny action (rather than folding into updateUnit) so the units table
 * can call it directly from an inline <select> with no full form roundtrip.
 */
export async function updateUnitStatus(id: string, status: UnitStatus) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_units").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteUnit(id: string, projectId: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_units").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await syncTotalUnits(projectId);
  revalidatePublicSite();
}

// ─── Timeline ─────────────────────────────────────────────────────────────

export interface TimelineInput {
  label: string;
  dateLabel: string;
  completed: boolean;
}

export async function createTimelineEvent(projectId: string, input: TimelineInput, orderIndex: number) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_timeline_events").insert({
    project_id: projectId,
    label: input.label,
    date_label: input.dateLabel,
    completed: input.completed,
    order_index: orderIndex,
  });
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function updateTimelineEvent(id: string, input: TimelineInput) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service
    .from("project_timeline_events")
    .update({ label: input.label, date_label: input.dateLabel, completed: input.completed })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteTimelineEvent(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("project_timeline_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderTimelineEvents(orderedIds: string[]) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      service.from("project_timeline_events").update({ order_index: index }).eq("id", id)
    )
  );
  revalidatePublicSite();
}

// ─── Unit documents (planimetrie) ──────────────────────────────────────────

export async function fetchUnitDocuments(unitId: string) {
  await requireAdmin();
  return getUnitDocuments(unitId);
}

export async function addUnitDocument(
  unitId: string,
  mediaId: string,
  docType: "floorplan" | "document",
  orderIndex: number
) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service
    .from("unit_documents")
    .insert({ unit_id: unitId, media_id: mediaId, doc_type: docType, order_index: orderIndex });
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function removeUnitDocument(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("unit_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}
