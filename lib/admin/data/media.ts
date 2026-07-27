import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";
import type { MediaKind, MediaLibraryItem } from "@/lib/types/media";

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export async function getMediaFolders(): Promise<MediaFolder[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("media_folders")
    .select("id, name, parent_id")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data.map((f) => ({ id: f.id, name: f.name, parentId: f.parent_id }));
}

export interface GetMediaItemsParams {
  folderId?: string | null;
  kind?: MediaKind | MediaKind[];
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getMediaItems(
  params: GetMediaItemsParams = {}
): Promise<{ items: MediaLibraryItem[]; total: number }> {
  const { folderId, kind, search, page = 1, pageSize = 40 } = params;
  const supabase = createServiceClient();

  let query = supabase
    .from("media_library")
    .select("id, folder_id, storage_path, bucket, kind, original_filename, mime_type, size_bytes, width, height, alt_text", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (folderId !== undefined) {
    query = folderId === null ? query.is("folder_id", null) : query.eq("folder_id", folderId);
  }
  if (Array.isArray(kind)) query = query.in("kind", kind);
  else if (kind) query = query.eq("kind", kind);
  if (search) query = query.ilike("original_filename", `%${search}%`);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error || !data) return { items: [], total: 0 };

  return {
    items: data.map((m) => ({
      id: m.id,
      storage_path: m.storage_path,
      bucket: m.bucket,
      kind: m.kind,
      original_filename: m.original_filename,
      mime_type: m.mime_type,
      size_bytes: m.size_bytes,
      width: m.width,
      height: m.height,
      alt_text: m.alt_text,
      url: getPublicMediaUrl(m.storage_path, m.bucket),
    })),
    total: count ?? 0,
  };
}
