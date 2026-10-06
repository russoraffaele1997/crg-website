import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

interface StoredFile {
  bucket: string;
  storagePath: string;
  filename: string;
}

export interface LeadContext {
  project: { id: string; title: string } | null;
  unit: { id: string; details: string; floorplans: StoredFile[] } | null;
  carBox: { id: string; details: string } | null;
  document: { id: string; title: string; url: string } | null;
}

/**
 * Everything shown in the lead email (unit sheet, price, car box, files) is
 * re-read here from the database by identifier. Nothing descriptive sent by
 * the browser is trusted, and attachments only ever come from our own storage.
 */
export async function resolveLeadContext(input: {
  projectId?: string;
  unitCode?: string;
  carBoxId?: string;
  documentId?: string;
}): Promise<LeadContext> {
  const empty: LeadContext = { project: null, unit: null, carBox: null, document: null };
  if (!isUuid(input.projectId)) return empty;

  const service = createServiceClient();
  const { data: project } = await service
    .from("projects")
    .select("id, title")
    .eq("id", input.projectId)
    .eq("publish_status", "published")
    .maybeSingle();
  if (!project) return empty;

  const [unitRes, boxRes, docRes] = await Promise.all([
    input.unitCode
      ? service
          .from("project_units")
          .select(
            "id, unit_code, name, typology, floor, interno, sqm, outdoor_sqm, rooms, destination, price, unit_documents(doc_type, order_index, media:media_library(storage_path, bucket, original_filename))"
          )
          .eq("project_id", project.id)
          .eq("unit_code", String(input.unitCode).slice(0, 50))
          .maybeSingle()
      : Promise.resolve({ data: null }),
    isUuid(input.carBoxId)
      ? service.from("project_car_boxes").select("id, name, sqm").eq("id", input.carBoxId).eq("project_id", project.id).maybeSingle()
      : Promise.resolve({ data: null }),
    isUuid(input.documentId)
      ? service
          .from("project_documents")
          .select("id, title, media:media_library(storage_path, bucket)")
          .eq("id", input.documentId)
          .eq("project_id", project.id)
          .eq("is_active", true)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  type UnitRow = {
    id: string; unit_code: string; name: string; typology: string; floor: string | null; interno: string | null;
    sqm: number; outdoor_sqm: number | null; rooms: string | null; destination: string | null; price: string | null;
    unit_documents: { doc_type: string; order_index: number; media: { storage_path: string; bucket: string; original_filename: string } | null }[];
  };
  const u = unitRes.data as UnitRow | null;
  const box = boxRes.data as { id: string; name: string; sqm: number } | null;
  const doc = docRes.data as unknown as { id: string; title: string; media: { storage_path: string; bucket: string } | null } | null;

  return {
    project: { id: project.id, title: project.title },
    unit: u
      ? {
          id: u.id,
          details: [
            `Unità: ${u.name} (cod. ${u.unit_code})`,
            `Tipologia: ${u.typology}`,
            u.floor ? `Piano: ${u.floor}${u.interno ? `, int. ${u.interno}` : ""}` : null,
            `Superficie: ${Number(u.sqm)} mq interni${u.outdoor_sqm ? ` + ${Number(u.outdoor_sqm)} mq esterni` : ""}`,
            u.rooms ? `Vani: ${u.rooms}` : null,
            u.destination ? `Destinazione: ${u.destination}` : null,
            u.price ? `Prezzo: ${u.price}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          floorplans: u.unit_documents
            .filter((d) => d.doc_type === "floorplan" && d.media)
            .sort((a, b) => a.order_index - b.order_index)
            .map((d) => ({ bucket: d.media!.bucket, storagePath: d.media!.storage_path, filename: d.media!.original_filename })),
        }
      : null,
    carBox: box ? { id: box.id, details: `${box.name} (${Number(box.sqm)} mq)` } : null,
    document: doc?.media
      ? { id: doc.id, title: doc.title, url: getPublicMediaUrl(doc.media.storage_path, doc.media.bucket) }
      : null,
  };
}

/** Reads a file straight from our Supabase storage — never from a URL supplied by the client. */
export async function downloadStoredFile(file: StoredFile): Promise<{ filename: string; content: Buffer } | null> {
  const service = createServiceClient();
  const { data, error } = await service.storage.from(file.bucket).download(file.storagePath);
  if (error || !data) return null;
  return { filename: file.filename, content: Buffer.from(await data.arrayBuffer()) };
}
