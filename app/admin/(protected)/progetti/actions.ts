"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { requireAdmin, requireContentEditor, assertCollaboratorDraftOnly } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { getUnitDocuments } from "@/lib/admin/data/units";
import { upsertSeoMeta } from "@/lib/actions/seo";
import type { AdminUser } from "@/lib/types/admin";
import type { ProjectCategory, ProjectStatus, UnitStatus, CarBoxStatus } from "@/lib/types/project";

function revalidatePublicSite() {
  // Projects surface on the homepage (featured), the listing, each detail
  // page, and the Header/Footer project dropdown/list on every page — so a
  // single layout-level revalidation is simpler and safer than tracking
  // every affected path individually.
  revalidatePath("/", "layout");
}

/** A collaborator can only ever write draft rows — force it server-side rather than trust the client. */
function resolvePublishStatus(admin: AdminUser, requested: "draft" | "published" | "archived") {
  return admin.role === "collaborator" ? "draft" : requested;
}

async function projectIdOf(table: string, id: string): Promise<string> {
  const service = createServiceClient();
  const { data, error } = await service.from(table).select("project_id").eq("id", id).single();
  if (error || !data) throw new Error("Elemento non trovato.");
  return data.project_id as string;
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
  isSpotlight: boolean;
  spotlightSpecs: { label: string; value: string }[];
  publishStatus: "draft" | "published" | "archived";
  seoMetaTitle: string;
  seoMetaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

function slugFromTitle(title: string) {
  return slugify(title, { lower: true, strict: true, locale: "it" });
}

/** Only one project can be the homepage spotlight — enforced by a DB unique
 * index too, so any other row must be cleared before this one is set. */
async function clearOtherSpotlights(exceptId: string | null) {
  const service = createServiceClient();
  let query = service.from("projects").update({ is_spotlight: false }).eq("is_spotlight", true);
  if (exceptId) query = query.neq("id", exceptId);
  await query;
}

export async function suggestProjectSlug(title: string) {
  await requireAdmin();
  return slugFromTitle(title);
}

export async function createProject(input: ProjectGeneralInput): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  const service = createServiceClient();

  const seoMetaId = await upsertSeoMeta(null, input);

  if (input.isSpotlight) await clearOtherSpotlights(null);

  const { data, error } = await service
    .from("projects")
    .insert({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      location: input.location,
      category: input.category,
      status: input.status,
      status_label: input.statusLabel.trim() || null,
      short_description: input.shortDescription,
      description: input.description,
      cover_image_id: input.coverImageId,
      is_featured: input.isFeatured,
      featured_order: input.featuredOrder,
      is_spotlight: input.isSpotlight,
      spotlight_specs: input.spotlightSpecs,
      publish_status: resolvePublishStatus(admin, input.publishStatus),
      seo_meta_id: seoMetaId,
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
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", id);
  const service = createServiceClient();

  const { data: existing } = await service.from("projects").select("seo_meta_id").eq("id", id).single();
  const seoMetaId = await upsertSeoMeta(existing?.seo_meta_id ?? null, input);

  if (input.isSpotlight) await clearOtherSpotlights(id);

  const { error } = await service
    .from("projects")
    .update({
      slug: input.slug || slugFromTitle(input.title),
      title: input.title,
      location: input.location,
      category: input.category,
      status: input.status,
      status_label: input.statusLabel.trim() || null,
      short_description: input.shortDescription,
      description: input.description,
      cover_image_id: input.coverImageId,
      is_featured: input.isFeatured,
      featured_order: input.featuredOrder,
      is_spotlight: input.isSpotlight,
      spotlight_specs: input.spotlightSpecs,
      publish_status: resolvePublishStatus(admin, input.publishStatus),
      seo_meta_id: seoMetaId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteProject(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", id);
  const service = createServiceClient();
  const { error } = await service.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
  redirect("/admin/progetti");
}

// ─── Gallery ──────────────────────────────────────────────────────────────

export async function addGalleryImage(projectId: string, mediaId: string, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_gallery_images")
    .insert({ project_id: projectId, media_id: mediaId, order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Immagine non aggiunta.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function removeGalleryImage(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_gallery_images", id));
  const service = createServiceClient();
  const { error } = await service.from("project_gallery_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderGalleryImages(orderedIds: string[]) {
  const admin = await requireContentEditor();
  if (orderedIds.length > 0) {
    await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_gallery_images", orderedIds[0]));
  }
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      service.from("project_gallery_images").update({ order_index: index }).eq("id", id)
    )
  );
  revalidatePublicSite();
}

// ─── Features (highlights + technical) ─────────────────────────────────────

export async function addFeature(projectId: string, kind: "highlight" | "technical", title: string, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_features")
    .insert({ project_id: projectId, kind, title, order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Elemento non aggiunto.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function updateFeature(id: string, title: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_features", id));
  const service = createServiceClient();
  const { error } = await service.from("project_features").update({ title }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteFeature(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_features", id));
  const service = createServiceClient();
  const { error } = await service.from("project_features").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderFeatures(orderedIds: string[]) {
  const admin = await requireContentEditor();
  if (orderedIds.length > 0) {
    await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_features", orderedIds[0]));
  }
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
  description: string;
}

async function syncTotalUnits(projectId: string) {
  const service = createServiceClient();
  const { count } = await service
    .from("project_units")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);
  await service.from("projects").update({ total_units: count ?? 0 }).eq("id", projectId);
}

export async function createUnit(projectId: string, input: UnitInput, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { data, error } = await service.from("project_units").insert({
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
    description: input.description || null,
    order_index: orderIndex,
  }).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Unità non creata.");
  await syncTotalUnits(projectId);
  revalidatePublicSite();
  return { id: data.id };
}

export async function updateUnit(id: string, projectId: string, input: UnitInput) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
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
      description: input.description || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

/**
 * The single most important write in the whole CMS per the client's brief:
 * "when I sell an apartment, I just want to change its status." Kept as its
 * own tiny action (rather than folding into updateUnit) so the units table
 * can call it directly from an inline <select> with no full form roundtrip.
 */
export async function updateUnitStatus(id: string, status: UnitStatus) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_units", id));
  const service = createServiceClient();
  const { error } = await service.from("project_units").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteUnit(id: string, projectId: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service.from("project_units").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await syncTotalUnits(projectId);
  revalidatePublicSite();
}

// ─── Car boxes (posti auto) ─────────────────────────────────────────────────

export async function updateCarBoxPlan(projectId: string, mediaId: string | null) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service.from("projects").update({ car_box_plan_media_id: mediaId }).eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export interface CarBoxInput {
  name: string;
  sqm: number;
}

export async function createCarBox(projectId: string, input: CarBoxInput, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { data, error } = await service.from("project_car_boxes").insert({
    project_id: projectId,
    name: input.name,
    sqm: input.sqm,
    order_index: orderIndex,
  }).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Box non creato.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function updateCarBox(id: string, projectId: string, input: CarBoxInput) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service
    .from("project_car_boxes")
    .update({ name: input.name, sqm: input.sqm })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function updateCarBoxStatus(id: string, projectId: string, status: CarBoxStatus) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service.from("project_car_boxes").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteCarBox(id: string, projectId: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service.from("project_car_boxes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

// ─── Avanzamento: fasi del cantiere ────────────────────────────────────────

export interface TimelineInput {
  label: string;
  /** Free text shown publicly ("Primavera 2027"); generated from sortableDate when empty. */
  dateLabel: string;
  sortableDate: string | null;
  description: string;
  weight: number;
  completed: boolean;
}

function timelineRow(input: TimelineInput) {
  const date = input.sortableDate || null;
  const dateLabel =
    input.dateLabel.trim() ||
    (date ? new Date(`${date}T12:00:00`).toLocaleDateString("it-IT", { month: "long", year: "numeric" }) : "");
  return {
    label: input.label.trim(),
    date_label: dateLabel,
    sortable_date: date,
    description: input.description.trim() || null,
    weight: Math.min(10, Math.max(1, Math.round(input.weight) || 1)),
    completed: input.completed,
  };
}

export async function createTimelineEvent(projectId: string, input: TimelineInput, orderIndex: number): Promise<{ id: string; dateLabel: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const row = timelineRow(input);
  const { data, error } = await service
    .from("project_timeline_events")
    .insert({ project_id: projectId, ...row, order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Fase non creata.");
  revalidatePublicSite();
  return { id: data.id, dateLabel: row.date_label };
}

export async function updateTimelineEvent(id: string, input: TimelineInput): Promise<{ dateLabel: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_timeline_events", id));
  const service = createServiceClient();
  const row = timelineRow(input);
  const { error } = await service.from("project_timeline_events").update(row).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
  return { dateLabel: row.date_label };
}

export async function deleteTimelineEvent(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_timeline_events", id));
  const service = createServiceClient();
  const { error } = await service.from("project_timeline_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderTimelineEvents(orderedIds: string[]) {
  const admin = await requireContentEditor();
  if (orderedIds.length > 0) {
    await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_timeline_events", orderedIds[0]));
  }
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      service.from("project_timeline_events").update({ order_index: index }).eq("id", id)
    )
  );
  revalidatePublicSite();
}

async function projectIdOfTimelineEvent(eventId: string): Promise<string> {
  return projectIdOf("project_timeline_events", eventId);
}

export async function addTimelineImage(eventId: string, mediaId: string, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOfTimelineEvent(eventId));
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_timeline_images")
    .insert({ timeline_event_id: eventId, media_id: mediaId, order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Foto non aggiunta.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function removeTimelineImage(id: string) {
  const admin = await requireContentEditor();
  const service = createServiceClient();
  const { data: img } = await service.from("project_timeline_images").select("timeline_event_id").eq("id", id).single();
  if (img) await assertCollaboratorDraftOnly(admin, "projects", await projectIdOfTimelineEvent(img.timeline_event_id));
  const { error } = await service.from("project_timeline_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

// ─── Consegna, prossima azione e avvisi ───────────────────────────────────

export async function updateProjectDelivery(projectId: string, expectedDelivery: string | null, expectedDeliveryLabel: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service
    .from("projects")
    .update({ expected_delivery: expectedDelivery || null, expected_delivery_label: expectedDeliveryLabel.trim() || null })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export interface ProjectMessagingInput {
  nextActionText: string;
  nextActionExpiresOn: string | null;
  nextActionHidden: boolean;
  lowStockThreshold: number;
  autoAlertsEnabled: boolean;
  alertText: string;
  alertTone: "info" | "success" | "warning";
  alertExpiresOn: string | null;
}

export async function updateProjectMessaging(projectId: string, input: ProjectMessagingInput) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { error } = await service
    .from("projects")
    .update({
      next_action_text: input.nextActionText.trim() || null,
      next_action_expires_on: input.nextActionExpiresOn || null,
      next_action_hidden: input.nextActionHidden,
      low_stock_threshold: Math.max(0, Math.round(input.lowStockThreshold) || 0),
      auto_alerts_enabled: input.autoAlertsEnabled,
      alert_text: input.alertText.trim() || null,
      alert_tone: input.alertText.trim() ? input.alertTone : null,
      alert_expires_on: input.alertExpiresOn || null,
    })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

// ─── Diario di cantiere ───────────────────────────────────────────────────

export interface ProjectUpdateInput {
  publishedOn: string;
  title: string;
  body: string;
  isPublic: boolean;
}

function updateRow(input: ProjectUpdateInput) {
  if (!input.title.trim()) throw new Error("Il titolo è obbligatorio.");
  return {
    published_on: input.publishedOn || new Date().toISOString().slice(0, 10),
    title: input.title.trim(),
    body: input.body.trim() || null,
    is_public: input.isPublic,
  };
}

export async function createProjectUpdate(projectId: string, input: ProjectUpdateInput): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_updates")
    .insert({ project_id: projectId, ...updateRow(input) })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Aggiornamento non creato.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function updateProjectUpdate(id: string, input: ProjectUpdateInput) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_updates", id));
  const service = createServiceClient();
  const { error } = await service.from("project_updates").update(updateRow(input)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteProjectUpdate(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_updates", id));
  const service = createServiceClient();
  const { error } = await service.from("project_updates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function addUpdateImage(updateId: string, mediaId: string, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_updates", updateId));
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_update_images")
    .insert({ update_id: updateId, media_id: mediaId, order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Foto non aggiunta.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function removeUpdateImage(id: string) {
  const admin = await requireContentEditor();
  const service = createServiceClient();
  const { data: img } = await service.from("project_update_images").select("update_id").eq("id", id).single();
  if (img) await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_updates", img.update_id));
  const { error } = await service.from("project_update_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

// ─── Documenti ────────────────────────────────────────────────────────────

export interface ProjectDocumentInput {
  mediaId: string;
  category: "capitolato" | "brochure" | "planimetrie" | "energetica" | "box" | "altro";
  title: string;
  requiresContact: boolean;
  isActive: boolean;
}

export async function createProjectDocument(projectId: string, input: ProjectDocumentInput, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  if (!input.title.trim()) throw new Error("Il titolo è obbligatorio.");
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_documents")
    .insert({
      project_id: projectId,
      media_id: input.mediaId,
      category: input.category,
      title: input.title.trim(),
      requires_contact: input.requiresContact,
      is_active: input.isActive,
      order_index: orderIndex,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Documento non aggiunto.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function updateProjectDocument(id: string, input: Omit<ProjectDocumentInput, "mediaId">) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_documents", id));
  if (!input.title.trim()) throw new Error("Il titolo è obbligatorio.");
  const service = createServiceClient();
  const { error } = await service
    .from("project_documents")
    .update({
      category: input.category,
      title: input.title.trim(),
      requires_contact: input.requiresContact,
      is_active: input.isActive,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteProjectDocument(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_documents", id));
  const service = createServiceClient();
  const { error } = await service.from("project_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderProjectDocuments(orderedIds: string[]) {
  const admin = await requireContentEditor();
  if (orderedIds.length > 0) {
    await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_documents", orderedIds[0]));
  }
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) => service.from("project_documents").update({ order_index: index }).eq("id", id))
  );
  revalidatePublicSite();
}

// ─── Chi realizza ─────────────────────────────────────────────────────────

export interface ProjectPartnerInput {
  name: string;
  role: string;
  logoMediaId: string | null;
  website: string;
}

function partnerRow(input: ProjectPartnerInput) {
  if (!input.name.trim() || !input.role.trim()) throw new Error("Nome e ruolo sono obbligatori.");
  const website = input.website.trim();
  return {
    name: input.name.trim(),
    role: input.role.trim(),
    logo_media_id: input.logoMediaId,
    website: website ? (/^https?:\/\//i.test(website) ? website : `https://${website}`) : null,
  };
}

export async function createProjectPartner(projectId: string, input: ProjectPartnerInput, orderIndex: number): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", projectId);
  const service = createServiceClient();
  const { data, error } = await service
    .from("project_partners")
    .insert({ project_id: projectId, ...partnerRow(input), order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Soggetto non aggiunto.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function updateProjectPartner(id: string, input: ProjectPartnerInput) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_partners", id));
  const service = createServiceClient();
  const { error } = await service.from("project_partners").update(partnerRow(input)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function deleteProjectPartner(id: string) {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_partners", id));
  const service = createServiceClient();
  const { error } = await service.from("project_partners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}

export async function reorderProjectPartners(orderedIds: string[]) {
  const admin = await requireContentEditor();
  if (orderedIds.length > 0) {
    await assertCollaboratorDraftOnly(admin, "projects", await projectIdOf("project_partners", orderedIds[0]));
  }
  const service = createServiceClient();
  await Promise.all(
    orderedIds.map((id, index) => service.from("project_partners").update({ order_index: index }).eq("id", id))
  );
  revalidatePublicSite();
}

// ─── Unit documents (planimetrie) ──────────────────────────────────────────

export async function fetchUnitDocuments(unitId: string) {
  await requireAdmin();
  return getUnitDocuments(unitId);
}

async function projectIdOfUnit(unitId: string): Promise<string> {
  const service = createServiceClient();
  const { data, error } = await service.from("project_units").select("project_id").eq("id", unitId).single();
  if (error || !data) throw new Error("Unità non trovata.");
  return data.project_id;
}

export async function addUnitDocument(
  unitId: string,
  mediaId: string,
  docType: "floorplan" | "photo",
  orderIndex: number
): Promise<{ id: string }> {
  const admin = await requireContentEditor();
  await assertCollaboratorDraftOnly(admin, "projects", await projectIdOfUnit(unitId));
  const service = createServiceClient();
  const { data, error } = await service
    .from("unit_documents")
    .insert({ unit_id: unitId, media_id: mediaId, doc_type: docType, order_index: orderIndex })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "File non aggiunto.");
  revalidatePublicSite();
  return { id: data.id };
}

export async function removeUnitDocument(id: string) {
  const admin = await requireContentEditor();
  const service = createServiceClient();
  const { data: doc } = await service.from("unit_documents").select("unit_id").eq("id", id).single();
  if (doc) {
    await assertCollaboratorDraftOnly(admin, "projects", await projectIdOfUnit(doc.unit_id));
  }
  const { error } = await service.from("unit_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicSite();
}
