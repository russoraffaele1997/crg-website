"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { createMediaRecord } from "@/lib/actions/media";
import type { MediaLibraryItem } from "@/lib/types/media";

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

export default function SimpleImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
}: {
  value: MediaLibraryItem | null;
  onChange: (media: MediaLibraryItem | null) => void;
  label?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const dims = await readImageDimensions(file);
      const path = `general/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) throw new Error(uploadError.message);

      const kind = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "document";

      const media = await createMediaRecord({
        storagePath: path,
        kind,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        width: dims?.width,
        height: dims?.height,
      });

      onChange(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload non riuscito.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative inline-block">
          {value.kind === "image" ? (
            <img
              src={value.url}
              alt={value.original_filename}
              className="h-32 w-auto rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <div className="h-32 w-40 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-500 px-3 text-center">
              {value.original_filename}
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-crg-red transition-colors"
            aria-label="Rimuovi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 h-32 w-40 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-crg-red hover:text-crg-red transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-xs">{uploading ? "Caricamento..." : "Carica file"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
