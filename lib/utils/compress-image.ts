import imageCompression from "browser-image-compression";

/**
 * Client-side compression before upload — keeps large photos from admins'
 * phones/cameras well under Vercel's request body limits and off the
 * Storage bill. Skips non-images and files already under 500KB.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 500 * 1024) return file;

  try {
    return await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      initialQuality: 0.82,
    });
  } catch {
    // Compression is a best-effort optimization — never block an upload on it.
    return file;
  }
}
