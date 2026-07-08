export type MediaKind = "image" | "video" | "pdf" | "document";

export interface MediaLibraryItem {
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
  url: string;
}
