"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { addBlogGalleryImage, removeBlogGalleryImage } from "@/app/admin/(protected)/blog/actions";
import type { MediaLibraryItem } from "@/lib/types/media";

interface GalleryItem {
  id: string;
  media: { id: string; url: string; original_filename: string } | null;
}

export default function BlogGalleryManager({
  postId,
  initialItems,
}: {
  postId: string;
  initialItems: GalleryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = async (media: MediaLibraryItem) => {
    const { id } = await addBlogGalleryImage(postId, media.id, items.length);
    setItems((prev) => [...prev, { id, media: { id: media.id, url: media.url, original_filename: media.original_filename } }]);
  };

  const handleRemove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await removeBlogGalleryImage(id);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Gallery</h2>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi immagine
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessuna immagine in gallery.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden">
              {item.media && <img src={item.media.url} alt={item.media.original_filename} className="w-full h-full object-cover" />}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaLibraryModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} kindFilter="image" />
    </div>
  );
}
