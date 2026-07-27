"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import MediaLibraryModal from "./MediaLibraryModal";
import type { MediaLibraryItem, MediaKind } from "@/lib/types/media";

export default function MediaField({
  value,
  onChange,
  label,
  kindFilter = "image",
}: {
  value: MediaLibraryItem | null;
  onChange: (media: MediaLibraryItem | null) => void;
  label?: string;
  kindFilter?: MediaKind | MediaKind[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">{label}</label>
      )}

      {value ? (
        <div className="relative inline-block">
          {value.kind === "image" ? (
            <img
              src={value.url}
              alt={value.original_filename}
              className="h-32 w-auto rounded-lg border border-slate-200 object-cover cursor-pointer"
              onClick={() => setOpen(true)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-32 w-40 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-500 px-3 text-center"
            >
              {value.original_filename}
            </button>
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
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center gap-2 h-32 w-40 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-crg-red hover:text-crg-red transition-colors"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-xs">Scegli immagine</span>
        </button>
      )}

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onChange}
        kindFilter={kindFilter}
      />
    </div>
  );
}
