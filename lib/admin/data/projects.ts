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
  }[];
  timeline: {
    id: string;
    label: string;
    dateLabel: string;
    completed: boolean;
    orderIndex: number;
  }[];
}

function toMediaRef(row: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null): MediaRef | null {
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
      short_description, description, is_featured, featured_order, publish_status,
      seo_meta_id, seo_meta:seo_meta_id(meta_title, meta_description, og_title, og_description),
      cover_media:media_library!cover_image_id(id, storage_path, bucket, original_filename, kind),
      project_gallery_images(id, order_index, media:media_library(id, storage_path, bucket, original_filename, kind)),
      project_features(id, kind, title, order_index),
      project_units(id, unit_code, name, typology, floor, interno, sqm, outdoor_sqm, rooms, destination, price, status, order_index, description),
      project_timeline_events(id, label, date_label, completed, order_index)
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
    status_label: string;
    short_description: string;
    description: string;
    is_featured: boolean;
    featured_order: number | null;
    publish_status: string;
    seo_meta_id: string | null;
    seo_meta: { meta_title: string | null; meta_description: string | null; og_title: string | null; og_description: string | null } | null;
    cover_media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
    project_gallery_images: { id: string; order_index: number; media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null }[];
    project_features: { id: string; kind: string; title: string; order_index: number }[];
    project_units: {
      id: string; unit_code: string; name: string; typology: string; floor: string | null;
      interno: string | null; sqm: number; outdoor_sqm: number | null; rooms: string | null;
      destination: string | null; price: string | null; status: string; order_index: number;
      description: string | null;
    }[];
    project_timeline_events: { id: string; label: string; date_label: string; completed: boolean; order_index: number }[];
  };

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    status: row.status,
    statusLabel: row.status_label,
    shortDescription: row.short_description,
    description: row.description,
    isFeatured: row.is_featured,
    featuredOrder: row.featured_order,
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
      })),
    timeline: row.project_timeline_events
      .sort((a, b) => a.order_index - b.order_index)
      .map((t) => ({ id: t.id, label: t.label, dateLabel: t.date_label, completed: t.completed, orderIndex: t.order_index })),
  };
}
