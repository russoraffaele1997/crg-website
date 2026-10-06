import "server-only";
import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";
import {
  computeProgress,
  countUnits,
  deliveryLabel,
  isLowStock,
  isRecent,
  priceFrom,
  resolveStatusLabel,
  todayIso,
} from "@/lib/projects/derive";
import type {
  AlertTone,
  CarBox,
  DocumentCategory,
  Project,
  ProjectSummary,
  ProjectTimelineItem,
  ProjectUnit,
  UnitFloorplan,
} from "@/lib/types/project";

type MediaRef = { storage_path: string; bucket: string } | null;

function mediaUrl(media: MediaRef): string {
  return media ? getPublicMediaUrl(media.storage_path, media.bucket) : "";
}

function byOrder<T extends { order_index: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.order_index - b.order_index);
}

const MESSAGING_COLUMNS = `
  expected_delivery, expected_delivery_label,
  next_action_text, next_action_expires_on, next_action_hidden,
  low_stock_threshold, auto_alerts_enabled, alert_text, alert_tone, alert_expires_on
`;

interface MessagingRow {
  expected_delivery: string | null;
  expected_delivery_label: string | null;
  next_action_text: string | null;
  next_action_expires_on: string | null;
  next_action_hidden: boolean;
  low_stock_threshold: number;
  auto_alerts_enabled: boolean;
  alert_text: string | null;
  alert_tone: AlertTone | null;
  alert_expires_on: string | null;
}

// ─── Summaries (cards, menus, sitemap) ──────────────────────────────────────
// Only what a card needs: counts and dates, never floorplans or galleries.

const SUMMARY_SELECT = `
  id, slug, title, location, category, status, status_label, short_description,
  expected_delivery, expected_delivery_label, low_stock_threshold,
  cover_media:media_library!cover_image_id(storage_path, bucket),
  project_units(status, price),
  project_timeline_events(completed, weight),
  project_updates(published_on, is_public)
`;

interface SummaryRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: Project["category"];
  status: Project["status"];
  status_label: string | null;
  short_description: string;
  expected_delivery: string | null;
  expected_delivery_label: string | null;
  low_stock_threshold: number;
  cover_media: MediaRef;
  project_units: { status: ProjectUnit["status"]; price: string | null }[];
  project_timeline_events: { completed: boolean; weight: number }[];
  project_updates: { published_on: string; is_public: boolean }[];
}

function mapSummary(row: SummaryRow, today: string): ProjectSummary {
  const units = countUnits(row.project_units);
  const latestUpdate = row.project_updates
    .filter((u) => u.is_public)
    .map((u) => u.published_on)
    .sort()
    .at(-1);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    status: row.status,
    statusLabel: resolveStatusLabel(row.status, row.status_label),
    shortDescription: row.short_description,
    coverImage: mediaUrl(row.cover_media),
    units,
    priceFrom: priceFrom(row.project_units),
    progress: computeProgress(row.project_timeline_events),
    deliveryLabel: deliveryLabel({
      expectedDelivery: row.expected_delivery,
      expectedDeliveryLabel: row.expected_delivery_label,
    }),
    lowStock: isLowStock(units, row.low_stock_threshold),
    recentUpdate: isRecent(latestUpdate, today),
  };
}

export const getProjectSummaries = cache(async (): Promise<ProjectSummary[]> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(SUMMARY_SELECT)
    .eq("publish_status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  const today = todayIso();
  return (data as unknown as SummaryRow[]).map((row) => mapSummary(row, today));
});

export async function getFeaturedProjects(count = 3): Promise<ProjectSummary[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(SUMMARY_SELECT)
    .eq("publish_status", "published")
    .eq("is_featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .limit(count);

  if (error || !data) return [];
  const today = todayIso();
  return (data as unknown as SummaryRow[]).map((row) => mapSummary(row, today));
}

// ─── Full project (detail page, homepage spotlight) ─────────────────────────

const PROJECT_SELECT = `
  id, slug, title, location, category, status, status_label,
  short_description, description, spotlight_specs,
  ${MESSAGING_COLUMNS},
  cover_media:media_library!cover_image_id(storage_path, bucket),
  car_box_plan:media_library!car_box_plan_media_id(storage_path, bucket),
  project_car_boxes(id, name, sqm, status, order_index),
  project_gallery_images(order_index, media:media_library(storage_path, bucket)),
  project_features(kind, title, order_index),
  project_units(
    id, unit_code, name, typology, floor, interno, sqm, outdoor_sqm, rooms, destination, price, status, order_index, description,
    unit_documents(id, doc_type, order_index, media:media_library(id, storage_path, bucket, original_filename, kind))
  ),
  project_timeline_events(
    id, label, date_label, sortable_date, description, completed, weight, order_index,
    project_timeline_images(order_index, media:media_library(storage_path, bucket))
  ),
  project_updates(
    id, published_on, title, body, is_public,
    project_update_images(order_index, media:media_library(storage_path, bucket))
  ),
  project_documents(
    id, category, title, requires_contact, is_active, order_index,
    media:media_library(storage_path, bucket, original_filename)
  ),
  project_partners(id, name, role, website, order_index, logo:media_library(storage_path, bucket))
`;

interface ProjectRow extends MessagingRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: Project["category"];
  status: Project["status"];
  status_label: string | null;
  short_description: string;
  description: string;
  spotlight_specs: { label: string; value: string }[] | null;
  cover_media: MediaRef;
  car_box_plan: MediaRef;
  project_car_boxes: { id: string; name: string; sqm: number; status: CarBox["status"]; order_index: number }[];
  project_gallery_images: { order_index: number; media: MediaRef }[];
  project_features: { kind: string; title: string; order_index: number }[];
  project_units: {
    id: string;
    unit_code: string;
    name: string;
    typology: string;
    floor: string | null;
    interno: string | null;
    sqm: number;
    outdoor_sqm: number | null;
    rooms: string | null;
    destination: string | null;
    price: string | null;
    status: ProjectUnit["status"];
    order_index: number;
    description: string | null;
    unit_documents: {
      id: string;
      doc_type: string;
      order_index: number;
      media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
    }[];
  }[];
  project_timeline_events: {
    id: string;
    label: string;
    date_label: string;
    sortable_date: string | null;
    description: string | null;
    completed: boolean;
    weight: number;
    order_index: number;
    project_timeline_images: { order_index: number; media: MediaRef }[];
  }[];
  project_updates: {
    id: string;
    published_on: string;
    title: string;
    body: string | null;
    is_public: boolean;
    project_update_images: { order_index: number; media: MediaRef }[];
  }[];
  project_documents: {
    id: string;
    category: DocumentCategory;
    title: string;
    requires_contact: boolean;
    is_active: boolean;
    order_index: number;
    media: { storage_path: string; bucket: string; original_filename: string } | null;
  }[];
  project_partners: {
    id: string;
    name: string;
    role: string;
    website: string | null;
    order_index: number;
    logo: MediaRef;
  }[];
}

function mapUnitFiles(docs: ProjectRow["project_units"][number]["unit_documents"], docType: string): UnitFloorplan[] {
  return byOrder(docs.filter((d) => d.doc_type === docType && d.media)).map((d) => ({
    id: d.id,
    url: getPublicMediaUrl(d.media!.storage_path, d.media!.bucket),
    filename: d.media!.original_filename,
    kind: d.media!.kind as UnitFloorplan["kind"],
  }));
}

function mapProject(row: ProjectRow): Project {
  const units: ProjectUnit[] = byOrder(row.project_units).map((u) => ({
    id: u.unit_code,
    name: u.name,
    typology: u.typology,
    floor: u.floor ?? undefined,
    interno: u.interno ?? undefined,
    sqm: Number(u.sqm),
    outdoorSqm: u.outdoor_sqm != null ? Number(u.outdoor_sqm) : undefined,
    rooms: u.rooms ?? undefined,
    destination: u.destination ?? undefined,
    price: u.price ?? undefined,
    status: u.status,
    description: u.description ?? undefined,
    floorplans: mapUnitFiles(u.unit_documents, "floorplan"),
    photos: mapUnitFiles(u.unit_documents, "photo"),
  }));

  const timeline: ProjectTimelineItem[] = byOrder(row.project_timeline_events).map((t) => ({
    id: t.id,
    label: t.label,
    date: t.date_label,
    sortableDate: t.sortable_date,
    completed: t.completed,
    weight: t.weight ?? 1,
    description: t.description,
    images: byOrder(t.project_timeline_images).map((i) => mediaUrl(i.media)).filter(Boolean),
  }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    status: row.status,
    statusLabel: resolveStatusLabel(row.status, row.status_label),
    shortDescription: row.short_description,
    description: row.description,
    coverImage: mediaUrl(row.cover_media),
    gallery: byOrder(row.project_gallery_images).map((g) => mediaUrl(g.media)).filter(Boolean),
    highlights: byOrder(row.project_features.filter((f) => f.kind === "highlight")).map((f) => f.title),
    technicalFeatures: byOrder(row.project_features.filter((f) => f.kind === "technical")).map((f) => f.title),
    timeline,
    units,
    spotlightSpecs: row.spotlight_specs ?? [],
    carBoxPlanUrl: mediaUrl(row.car_box_plan),
    carBoxes: byOrder(row.project_car_boxes).map((c) => ({ id: c.id, name: c.name, sqm: Number(c.sqm), status: c.status })),
    updates: row.project_updates
      .filter((u) => u.is_public)
      .sort((a, b) => b.published_on.localeCompare(a.published_on))
      .map((u) => ({
        id: u.id,
        publishedOn: u.published_on,
        title: u.title,
        body: u.body,
        images: byOrder(u.project_update_images).map((i) => mediaUrl(i.media)).filter(Boolean),
      })),
    // Documents released on request never ship their URL to the browser.
    documents: byOrder(row.project_documents.filter((d) => d.is_active && d.media)).map((d) => ({
      id: d.id,
      category: d.category,
      title: d.title,
      requiresContact: d.requires_contact,
      url: d.requires_contact ? "" : mediaUrl(d.media),
      filename: d.requires_contact ? "" : d.media!.original_filename,
    })),
    partners: byOrder(row.project_partners).map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      website: p.website,
      logoUrl: mediaUrl(p.logo),
    })),
    expectedDelivery: row.expected_delivery,
    expectedDeliveryLabel: row.expected_delivery_label,
    nextActionText: row.next_action_text,
    nextActionExpiresOn: row.next_action_expires_on,
    nextActionHidden: row.next_action_hidden,
    lowStockThreshold: row.low_stock_threshold,
    autoAlertsEnabled: row.auto_alerts_enabled,
    alertText: row.alert_text,
    alertTone: row.alert_tone,
    alertExpiresOn: row.alert_expires_on,
  };
}

/** Cached per request: generateMetadata and the page share one query. */
export const getProjectBySlug = cache(async (slug: string): Promise<Project | undefined> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("publish_status", "published")
    .maybeSingle();

  if (error || !data) return undefined;
  return mapProject(data as unknown as ProjectRow);
});

export async function getSpotlightProject(): Promise<Project | undefined> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("publish_status", "published")
    .eq("is_spotlight", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapProject(data as unknown as ProjectRow);
}
