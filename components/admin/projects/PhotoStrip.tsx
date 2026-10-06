"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import type { MediaLibraryItem } from "@/lib/types/media";

export interface PhotoItem {
  id: string;
  media: { url: string; original_filename: string } | null;
}

/** Small photo manager reused by construction phases and diary entries. */
export default function PhotoStrip({
  items,
  onAdd,
  onRemove,
}: {
  items: PhotoItem[];
  onAdd: (media: MediaLibraryItem) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div key={item.id} className="group relative w-20 h-20 rounded-md border border-slate-200 overflow-hidden bg-slate-50">
          {item.media && <img src={item.media.url} alt={item.media.original_filename} className="w-full h-full object-cover" />}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Rimuovi foto"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={busy}
        onClick={() => setPickerOpen(true)}
        className="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 text-slate-400 hover:border-crg-red hover:text-crg-red flex flex-col items-center justify-center gap-1 disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        <span className="text-[10px]">Foto</span>
      </button>
      <MediaLibraryModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        kindFilter="image"
        onSelect={async (media) => {
          setBusy(true);
          try {
            await onAdd(media);
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
