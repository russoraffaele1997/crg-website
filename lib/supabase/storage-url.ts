/**
 * Public URL for an object in Supabase Storage. Deterministic (no DB lookup
 * needed) — mirrors what supabase-js's storage.from(bucket).getPublicUrl()
 * would return, without requiring a client instance.
 */
export function getPublicMediaUrl(storagePath: string, bucket: string = "media") {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}
