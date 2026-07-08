"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireRole } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";
import { getMediaFolders, getMediaItems, type GetMediaItemsParams } from "@/lib/admin/data/media";
import type { MediaKind, MediaLibraryItem } from "@/lib/types/media";

/** Client components (e.g. the MediaLibraryModal picker) can't import the
 * server-only data layer directly, so these two thin wrappers expose it as
 * callable Server Actions. */
export async function fetchMediaFolders() {
  await requireAdmin();
  return getMediaFolders();
}

export async function fetchMediaItems(params: GetMediaItemsParams) {
  await requireAdmin();
  return getMediaItems(params);
}

interface CreateMediaRecordInput {
  storagePath: string;
  kind: MediaKind;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  folderId?: string | null;
}

function toMediaLibraryItem(data: {
  id: string;
  storage_path: string;
  bucket: string;
  kind: MediaKind;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
}): MediaLibraryItem {
  return {
    id: data.id,
    storage_path: data.storage_path,
    bucket: data.bucket,
    kind: data.kind,
    original_filename: data.original_filename,
    mime_type: data.mime_type,
    size_bytes: data.size_bytes,
    width: data.width,
    height: data.height,
    alt_text: data.alt_text,
    url: getPublicMediaUrl(data.storage_path, data.bucket),
  };
}

/**
 * Records a file that the browser already uploaded directly to Supabase
 * Storage (see components/admin/MediaField.tsx).
 */
export async function createMediaRecord(
  input: CreateMediaRecordInput
): Promise<MediaLibraryItem> {
  const admin = await requireAdmin();
  const service = createServiceClient();

  const { data, error } = await service
    .from("media_library")
    .insert({
      storage_path: input.storagePath,
      bucket: "media",
      kind: input.kind,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
      folder_id: input.folderId ?? null,
      uploaded_by: admin.id,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Upload del file non riuscito.");
  }

  revalidatePath("/admin/media");
  return toMediaLibraryItem(data);
}

/**
 * Uploads a replacement file into the SAME media_library row (same id), so
 * every place that already references this media (project cover, gallery,
 * blog post, ...) picks up the new file automatically. The old Storage
 * object is left in place (soft-orphaned) rather than risking a delete race.
 */
export async function replaceMediaFile(
  id: string,
  input: Omit<CreateMediaRecordInput, "folderId">
): Promise<MediaLibraryItem> {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { data, error } = await service
    .from("media_library")
    .update({
      storage_path: input.storagePath,
      kind: input.kind,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Sostituzione del file non riuscita.");
  }

  revalidatePath("/", "layout");
  return toMediaLibraryItem(data);
}

export async function deleteMediaItem(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();

  const { error } = await service.from("media_library").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      throw new Error("Questo file è in uso e non può essere eliminato. Rimuovilo prima dalle sezioni che lo usano.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/media");
}

export async function createMediaFolder(name: string, parentId: string | null) {
  await requireAdmin();
  const service = createServiceClient();

  const { data, error } = await service
    .from("media_folders")
    .insert({ name, parent_id: parentId })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Creazione cartella non riuscita.");
  revalidatePath("/admin/media");
  return data.id as string;
}

export async function renameMediaFolder(id: string, name: string) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service.from("media_folders").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function deleteMediaFolder(id: string) {
  await requireRole(["super_admin", "editor"]);
  const service = createServiceClient();
  const { error } = await service.from("media_folders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function moveMediaItem(id: string, folderId: string | null) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service.from("media_library").update({ folder_id: folderId }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}
