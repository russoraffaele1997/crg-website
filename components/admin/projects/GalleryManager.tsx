"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { X } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import SimpleImageUpload from "@/components/admin/SimpleImageUpload";
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
  const [uploadKey, setUploadKey] = useState(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleUpload = async (media: MediaLibraryItem | null) => {
    if (!media) return;
    await addGalleryImage(projectId, media.id, items.length);
    setItems((prev) => [...prev, { id: crypto.randomUUID(), media: { id: media.id, url: media.url, original_filename: media.original_filename } }]);
    setUploadKey((k) => k + 1); // reset the uploader to an empty state
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
        <SimpleImageUpload key={uploadKey} label="Aggiungi immagine alla gallery" value={null} onChange={handleUpload} />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessuna immagine in gallery.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
