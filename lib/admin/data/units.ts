import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";

export interface UnitDocumentMedia {
  id: string;
  url: string;
  original_filename: string;
  kind: "image" | "video" | "pdf" | "document";
}

export interface UnitDocument {
  id: string;
  docType: "floorplan" | "document";
  orderIndex: number;
  media: UnitDocumentMedia | null;
}

export async function getUnitDocuments(unitId: string): Promise<UnitDocument[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("unit_documents")
    .select("id, doc_type, order_index, media:media_library(id, storage_path, bucket, original_filename, kind)")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as {
    id: string;
    doc_type: "floorplan" | "document";
    order_index: number;
    media: { id: string; storage_path: string; bucket: string; original_filename: string; kind: string } | null;
  }[]).map((row) => ({
    id: row.id,
    docType: row.doc_type,
    orderIndex: row.order_index,
    media: row.media
      ? {
          id: row.media.id,
          url: getPublicMediaUrl(row.media.storage_path, row.media.bucket),
          original_filename: row.media.original_filename,
          kind: row.media.kind as UnitDocumentMedia["kind"],
        }
      : null,
  }));
}
