"use server";

import { requireAdmin } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicMediaUrl } from "@/lib/supabase/storage-url";
import type { MediaKind, MediaLibraryItem } from "@/lib/types/media";

interface CreateMediaRecordInput {
  storagePath: string;
  kind: MediaKind;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

/**
 * Records a file that the browser already uploaded directly to Supabase
 * Storage (see components/admin/SimpleImageUpload.tsx). Upload-only for now
 * — Phase 2 adds folders/search/compression/replace on top of this same
 * media_library table.
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
      uploaded_by: admin.id,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Upload del file non riuscito.");
  }

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
