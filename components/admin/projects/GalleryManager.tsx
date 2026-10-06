"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { addGalleryImage, removeGalleryImage, reorderGalleryImages } from "@/app/admin/(protected)/progetti/actions";
import type { MediaLibraryItem } from "@/lib/types/media";

interface GalleryItem {
  id: string;
  media: { id: string; url: string; original_filename: string } | null;
}

export default function GalleryManager({
  projectId,
  initialItems,
}: {
  projectId: string;
  initialItems: GalleryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSelect = async (media: MediaLibraryItem) => {
    const { id } = await addGalleryImage(projectId, media.id, items.length);
    setItems((prev) => [...prev, { id, media: { id: media.id, url: media.url, original_filename: media.original_filename } }]);
  };

  const handleRemove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await removeGalleryImage(id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await reorderGalleryImages(reordered.map((i) => i.id));
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Aggiungi immagine alla gallery</label>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex flex-col items-center justify-center gap-2 h-32 w-40 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-crg-red hover:text-crg-red transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">Scegli immagine</span>
        </button>
        <MediaLibraryModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} kindFilter="image" />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessuna immagine in gallery.</p>
      ) : (
        <DndContext id={`gallery-${projectId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className="flex items-center gap-3">
                    {item.media && (
                      <img src={item.media.url} alt={item.media.original_filename} className="w-14 h-14 object-cover rounded-md border border-slate-200" />
                    )}
                    <span className="text-sm text-slate-600 truncate flex-1">{item.media?.original_filename}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      aria-label="Rimuovi"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
