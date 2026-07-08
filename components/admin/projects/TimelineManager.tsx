"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import {
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  reorderTimelineEvents,
} from "@/app/admin/(protected)/progetti/actions";

interface TimelineItem {
  id: string;
  label: string;
  dateLabel: string;
  completed: boolean;
}

export default function TimelineManager({
  projectId,
  initialItems,
}: {
  projectId: string;
  initialItems: TimelineItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAdd = async () => {
    if (!draftLabel.trim() || !draftDate.trim()) return;
    setAdding(true);
    const input = { label: draftLabel.trim(), dateLabel: draftDate.trim(), completed: false };
    await createTimelineEvent(projectId, input, items.length);
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...input }]);
    setDraftLabel("");
    setDraftDate("");
    setAdding(false);
  };

  const patch = async (id: string, changes: Partial<TimelineItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const merged = { ...item, ...changes };
    await updateTimelineEvent(id, { label: merged.label, dateLabel: merged.dateLabel, completed: merged.completed });
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteTimelineEvent(id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await reorderTimelineEvents(reordered.map((i) => i.id));
  };

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-6">
        <input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          placeholder="Titolo fase (es. Inizio lavori)"
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-crg-red"
        />
        <input
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          placeholder="Data (es. Marzo 2026)"
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-crg-red"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !draftLabel.trim() || !draftDate.trim()}
          className="flex items-center justify-center gap-1.5 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessuna fase ancora.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => patch(item.id, { completed: e.target.checked })}
                      className="w-4 h-4 accent-crg-red shrink-0"
                      title="Completata"
                    />
                    <input
                      value={item.label}
                      onChange={(e) => patch(item.id, { label: e.target.value })}
                      className="flex-1 text-sm text-slate-700 bg-transparent focus:outline-none"
                    />
                    <input
                      value={item.dateLabel}
                      onChange={(e) => patch(item.id, { dateLabel: e.target.value })}
                      className="w-32 text-sm text-slate-500 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 shrink-0"
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
