"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import { addFeature, updateFeature, deleteFeature, reorderFeatures } from "@/app/admin/(protected)/progetti/actions";

interface FeatureItem {
  id: string;
  title: string;
}

export default function FeatureListManager({
  projectId,
  kind,
  title,
  initialItems,
}: {
  projectId: string;
  kind: "highlight" | "technical";
  title: string;
  initialItems: FeatureItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAdd = async () => {
    const value = draft.trim();
    if (!value) return;
    setAdding(true);
    const { id } = await addFeature(projectId, kind, value, items.length);
    setItems((prev) => [...prev, { id, title: value }]);
    setDraft("");
    setAdding(false);
  };

  const handleEdit = async (id: string, newTitle: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i)));
    await updateFeature(id, newTitle);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteFeature(id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await reorderFeatures(reordered.map((i) => i.id));
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900 mb-4">{title}</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Aggiungi voce..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-crg-red"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !draft.trim()}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessuna voce.</p>
      ) : (
        <DndContext id={`features-${projectId}-${kind}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className="flex items-center gap-2">
                    <input
                      value={item.title}
                      onChange={(e) => handleEdit(item.id, e.target.value)}
                      className="flex-1 text-sm text-slate-700 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      aria-label="Elimina"
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
