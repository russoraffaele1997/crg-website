import { createClient } from "@/lib/supabase/browser";
import { createMediaRecord } from "@/lib/actions/media";
import { compressImageIfNeeded } from "@/lib/utils/compress-image";
import type { MediaLibraryItem, MediaKind } from "@/lib/types/media";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-]+/g, "-");
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export async function uploadFileToMedia(file: File, folderId: string | null = null): Promise<MediaLibraryItem> {
  const processedFile = await compressImageIfNeeded(file);
  const dims = await readImageDimensions(processedFile);
  const path = `general/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage.from("media").upload(path, processedFile, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const kind: MediaKind = file.type.startsWith("image/")
    ? "image"
    : file.type === "application/pdf"
      ? "pdf"
      : "document";

  return createMediaRecord({
    storagePath: path,
    kind,
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: processedFile.size,
    width: dims?.width,
    height: dims?.height,
    folderId,
  });
}
