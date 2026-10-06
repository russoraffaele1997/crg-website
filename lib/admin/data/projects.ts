import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface AdminProjectListItem {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: string;
  status: string;
  publishStatus: string;
  totalUnits: number;
  updatedAt: string;
}

export async function getAdminProjects(): Promise<AdminProjectListItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, location, category, status, publish_status, total_units, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    category: p.category,
    status: p.status,
    publishStatus: p.publish_status,
    totalUnits: p.total_units,
    updatedAt: p.updated_at,
  }));
}

interface MediaRef {
  id: string;
  url: string;
  original_filename: string;
  kind: "image" | "video" | "pdf" | "document";
}

export interface AdminProjectDetail {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: string;
  status: string;
  statusLabel: string;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  featuredOrder: number | null;
  isSpotlight: boolean;
  spotlightSpecs: { label: string; value: string }[];
  mapAddress: string;
  carBoxPlan: MediaRef | null;
  carBoxes: { id: string; name: string; sqm: number; status: string; orderIndex: number }[];
  publishStatus: string;
  seoMetaId: string | null;
  seoMetaTitle: string;
  seoMetaDescription: string;
  ogTitle: string;
  ogDescription: string;
  coverImage: MediaRef | null;
  gallery: { id: string; orderIndex: number; media: MediaRef | null }[];
  highlights: { id: string; title: string; orderIndex: number }[];
  technicalFeatures: { id: string; title: string; orderIndex: number }[];
  units: {
    id: string;
    unitCode: string;
    name: string;
    typology: string;
    floor: string | null;
    interno: string | null;
    sqm: number;
    outdoorSqm: number | null;
    rooms: string | null;
    destination: string | null;
    price: string | null;
    status: string;
    orderIndex: number;
    description: string | null;
    hasFloorplan: boolean;
  }[];
  timeline: {
    id: string;
    label: string;
    dateLabel: string;
    sortableDate: string | null;
    description: string;
    weight: number;
    completed: boolean;
    orderIndex: number;
    images: { id: string; media: MediaRef | null }[];
  }[];
  updates: {
    id: string;
    publishedOn: string;
    title: string;
    body: string;
    isPublic: boolean;
    images: { id: string; media: MediaRef | null }[];
  }[];
  documents: {
    id: string;
    category: string;
    title: string;
    requiresContact: boolean;
    isActive: boolean;
    media: MediaRef | null;
  }[];
  partners: {
    id: string;
    name: string;
    role: string;
    website: string;
    logo: MediaRef | null;
  }[];
  messaging: {
    expectedDelivery: string | null;
    expectedDeliveryLabel: string;
    nextActionText: string;
    nextActionExpiresOn: string | null;
    nextActionHidden: boolean;
    lowStockThreshold: number;
    autoAlertsEnabled: boolean;
    alertText: string;
    alertTone: "info" | "success" | "warning";
    alertExpiresOn: string | null;
  };
  /** Leads received for this project still marked as new. */
  newLeads: number;
}

type RawMedia = { id: string; storage_path: string; bucket: string; original_filename: string; kind: string };

function toMediaRef(row: RawMedia | null): MediaRef | null {
  if (!row) return null;
  return {
    id: row.id,
    url: getPublicMediaUrl(row.storage_path, row.bucket),
    original_filename: row.original_filename,
    kind: row.kind as MediaRef["kind"],
  };
}

export async function getAdminProjectById(id: string): Promise<AdminProjectDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id, slug, title, location, category, status, status_label,
      short_description, description, is_featured, featured_order,
      is_spotlight, spotlight_specs, publish_status, map_address,
      expected_delivery, expected_delivery_label, next_action_text, next_action_expires_on, next_action_hidden,
      low_stock_threshold, auto_alerts_enabled, alert_text, alert_tone, alert_expires_on,
      seo_meta_id, seo_meta:seo_meta_id(meta_title, meta_description, og_title, og_description),
      cover_media:media_library!cover_image_id(id, storage_path, bucket, original_filename, kind),
      car_box_plan:media_library!car_box_plan_media_id(id, storage_path, bucket, original_filename, kind),
      project_car_boxes(id, name, sqm, status, order_index),
      project_gallery_images(id, order_index, media:media_library(id, storage_path, bucket, original_filename, kind)),
      project_features(id, kind, title, order_index),
      project_units(id, unit_code, name, typology, floor, interno, sqm, outdoor_sqm, rooms, destination, price, status, order_index, description, unit_documents(doc_type)),
      project_timeline_events(
        id, label, date_label, sortable_date, description, weight, completed, order_index,
        project_timeline_images(id, order_index, media:media_library(id, storage_path, bucket, original_filename, kind))
      ),
      project_updates(
        id, published_on, title, body, is_public,
        project_update_images(id, order_index, media:media_library(id, storage_path, bucket, original_filename, kind))
      ),
      project_documents(id, category, title, requires_contact, is_active, order_index, media:media_library(id, storage_path, bucket, original_filename, kind)),
      project_partners(id, name, role, website, order_index, logo:media_library(id, storage_path, bucket, original_filename, kind))
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string;
    slug: string;
    title: string;
    location: string;
    category: string;
    status: string;
    status_label: string | null;
    short_description: string;
    description: string;
    is_featured: boolean;
    featured_order: number | null;
    is_spotlight: boolean;
    spotlight_specs: { label: string; value: string }[] | null;
    publish_status: string;
    map_address: string | null;
    expected_delivery: string | null;
    expected_delivery_label: string | null;
    next_action_text: string | null;
    next_action_expires_on: string | null;
    next_action_hidden: boolean;
    low_stock_threshold: number;
    auto_alerts_enabled: boolean;
    alert_text: string | null;
    alert_tone: "info" | "success" | "warning" | null;
    alert_expires_on: string | null;
    seo_meta_id: string | null;
    seo_meta: { meta_title: string | null; meta_description: string | null; og_title: string | null; og_description: string | null } | null;
    cover_media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
    car_box_plan: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
    project_car_boxes: { id: string; name: string; sqm: number; status: string; order_index: number }[];
    project_gallery_images: { id: string; order_index: number; media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null }[];
    project_features: { id: string; kind: string; title: string; order_index: number }[];
    project_units: {
      id: string; unit_code: string; name: string; typology: string; floor: string | null;
      interno: string | null; sqm: number; outdoor_sqm: number | null; rooms: string | null;
      destination: string | null; price: string | null; status: string; order_index: number;
      description: string | null;
      unit_documents: { doc_type: string }[];
    }[];
    project_timeline_events: {
      id: string; label: string; date_label: string; sortable_date: string | null; description: string | null;
      weight: number; completed: boolean; order_index: number;
      project_timeline_images: { id: string; order_index: number; media: RawMedia | null }[];
    }[];
    project_updates: {
      id: string; published_on: string; title: string; body: string | null; is_public: boolean;
      project_update_images: { id: string; order_index: number; media: RawMedia | null }[];
    }[];
    project_documents: { id: string; category: string; title: string; requires_contact: boolean; is_active: boolean; order_index: number; media: RawMedia | null }[];
    project_partners: { id: string; name: string; role: string; website: string | null; order_index: number; logo: RawMedia | null }[];
  };

  const { count: newLeads } = await supabase
    .from("lead_submissions")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id)
    .eq("status", "new");
  const byOrder = <T extends { order_index: number }>(rows: T[]) => [...rows].sort((a, b) => a.order_index - b.order_index);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    status: row.status,
    statusLabel: row.status_label ?? "",
    shortDescription: row.short_description,
    description: row.description,
    isFeatured: row.is_featured,
    featuredOrder: row.featured_order,
    isSpotlight: row.is_spotlight,
    spotlightSpecs: row.spotlight_specs ?? [],
    mapAddress: row.map_address ?? "",
    carBoxPlan: toMediaRef(row.car_box_plan),
    carBoxes: [...row.project_car_boxes]
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => ({ id: c.id, name: c.name, sqm: Number(c.sqm), status: c.status, orderIndex: c.order_index })),
    publishStatus: row.publish_status,
    seoMetaId: row.seo_meta_id,
    seoMetaTitle: row.seo_meta?.meta_title ?? "",
    seoMetaDescription: row.seo_meta?.meta_description ?? "",
    ogTitle: row.seo_meta?.og_title ?? "",
    ogDescription: row.seo_meta?.og_description ?? "",
    coverImage: toMediaRef(row.cover_media),
    gallery: [...row.project_gallery_images]
      .sort((a, b) => a.order_index - b.order_index)
      .map((g) => ({ id: g.id, orderIndex: g.order_index, media: toMediaRef(g.media) })),
    highlights: row.project_features
      .filter((f) => f.kind === "highlight")
      .sort((a, b) => a.order_index - b.order_index)
      .map((f) => ({ id: f.id, title: f.title, orderIndex: f.order_index })),
    technicalFeatures: row.project_features
      .filter((f) => f.kind === "technical")
      .sort((a, b) => a.order_index - b.order_index)
      .map((f) => ({ id: f.id, title: f.title, orderIndex: f.order_index })),
    units: [...row.project_units]
      .sort((a, b) => a.order_index - b.order_index)
      .map((u) => ({
        id: u.id,
        unitCode: u.unit_code,
        name: u.name,
        typology: u.typology,
        floor: u.floor,
        interno: u.interno,
        sqm: Number(u.sqm),
        outdoorSqm: u.outdoor_sqm != null ? Number(u.outdoor_sqm) : null,
        rooms: u.rooms,
        destination: u.destination,
        price: u.price,
        description: u.description,
        status: u.status,
        orderIndex: u.order_index,
        hasFloorplan: u.unit_documents.some((d) => d.doc_type === "floorplan"),
      })),
    timeline: byOrder(row.project_timeline_events).map((t) => ({
      id: t.id,
      label: t.label,
      dateLabel: t.date_label,
      sortableDate: t.sortable_date,
      description: t.description ?? "",
      weight: t.weight ?? 1,
      completed: t.completed,
      orderIndex: t.order_index,
      images: byOrder(t.project_timeline_images).map((i) => ({ id: i.id, media: toMediaRef(i.media) })),
    })),
    updates: [...row.project_updates]
      .sort((a, b) => b.published_on.localeCompare(a.published_on))
      .map((u) => ({
        id: u.id,
        publishedOn: u.published_on,
        title: u.title,
        body: u.body ?? "",
        isPublic: u.is_public,
        images: byOrder(u.project_update_images).map((i) => ({ id: i.id, media: toMediaRef(i.media) })),
      })),
    documents: byOrder(row.project_documents).map((d) => ({
      id: d.id,
      category: d.category,
      title: d.title,
      requiresContact: d.requires_contact,
      isActive: d.is_active,
      media: toMediaRef(d.media),
    })),
    partners: byOrder(row.project_partners).map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      website: p.website ?? "",
      logo: toMediaRef(p.logo),
    })),
    messaging: {
      expectedDelivery: row.expected_delivery,
      expectedDeliveryLabel: row.expected_delivery_label ?? "",
      nextActionText: row.next_action_text ?? "",
      nextActionExpiresOn: row.next_action_expires_on,
      nextActionHidden: row.next_action_hidden,
      lowStockThreshold: row.low_stock_threshold,
      autoAlertsEnabled: row.auto_alerts_enabled,
      alertText: row.alert_text ?? "",
      alertTone: row.alert_tone ?? "info",
      alertExpiresOn: row.alert_expires_on,
    },
    newLeads: newLeads ?? 0,
  };
}
