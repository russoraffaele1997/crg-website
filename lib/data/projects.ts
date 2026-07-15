import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";
import type { Project, ProjectUnit, ProjectTimelineItem, UnitFloorplan } from "@/lib/types/project";

const PROJECT_SELECT = `
  id, slug, title, location, category, status, status_label,
  short_description, description, total_units, is_featured, featured_order,
  spotlight_specs,
  cover_media:media_library!cover_image_id(storage_path, bucket),
  project_gallery_images(order_index, media:media_library(storage_path, bucket)),
  project_features(kind, title, order_index),
  project_units(
    id, unit_code, name, typology, floor, interno, sqm, outdoor_sqm, rooms, destination, price, status, order_index, description,
    unit_documents(id, doc_type, order_index, media:media_library(id, storage_path, bucket, original_filename, kind))
  ),
  project_timeline_events(label, date_label, completed, order_index)
`;

type MediaRef = { storage_path: string; bucket: string } | null;

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: Project["category"];
  status: Project["status"];
  status_label: string;
  short_description: string;
  description: string;
  total_units: number;
  is_featured: boolean;
  featured_order: number | null;
  spotlight_specs: { label: string; value: string }[] | null;
  cover_media: MediaRef;
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
    label: string;
    date_label: string;
    completed: boolean;
    order_index: number;
  }[];
}

function mapProject(row: ProjectRow): Project {
  const gallery = [...row.project_gallery_images]
    .sort((a, b) => a.order_index - b.order_index)
    .map((g) => (g.media ? getPublicMediaUrl(g.media.storage_path, g.media.bucket) : ""))
    .filter(Boolean);

  const highlights = row.project_features
    .filter((f) => f.kind === "highlight")
    .sort((a, b) => a.order_index - b.order_index)
    .map((f) => f.title);

  const technicalFeatures = row.project_features
    .filter((f) => f.kind === "technical")
    .sort((a, b) => a.order_index - b.order_index)
    .map((f) => f.title);

  const units: ProjectUnit[] = [...row.project_units]
    .sort((a, b) => a.order_index - b.order_index)
    .map((u) => ({
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
      floorplans: [...u.unit_documents]
        .filter((d) => d.doc_type === "floorplan" && d.media)
        .sort((a, b) => a.order_index - b.order_index)
        .map((d) => ({
          id: d.id,
          url: getPublicMediaUrl(d.media!.storage_path, d.media!.bucket),
          filename: d.media!.original_filename,
          kind: d.media!.kind as UnitFloorplan["kind"],
        })),
      photos: [...u.unit_documents]
        .filter((d) => d.doc_type === "photo" && d.media)
        .sort((a, b) => a.order_index - b.order_index)
        .map((d) => ({
          id: d.id,
          url: getPublicMediaUrl(d.media!.storage_path, d.media!.bucket),
          filename: d.media!.original_filename,
          kind: d.media!.kind as UnitFloorplan["kind"],
        })),
    }));

  const timeline: ProjectTimelineItem[] = [...row.project_timeline_events]
    .sort((a, b) => a.order_index - b.order_index)
    .map((t) => ({ label: t.label, date: t.date_label, completed: t.completed }));

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
    coverImage: row.cover_media ? getPublicMediaUrl(row.cover_media.storage_path, row.cover_media.bucket) : "",
    gallery,
    highlights,
    technicalFeatures,
    timeline,
    units,
    totalUnits: row.total_units,
    spotlightSpecs: row.spotlight_specs ?? [],
  };
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("publish_status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as ProjectRow[]).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("publish_status", "published")
    .maybeSingle();

  if (error || !data) return undefined;
  return mapProject(data as unknown as ProjectRow);
}

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

export async function getFeaturedProjects(count = 3): Promise<Project[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("publish_status", "published")
    .eq("is_featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .limit(count);

  if (error || !data) return [];
  return (data as unknown as ProjectRow[]).map(mapProject);
}
