"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ChevronDown, Plus, X } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import PhotoStrip, { type PhotoItem } from "./PhotoStrip";
import {
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  reorderTimelineEvents,
  addTimelineImage,
  removeTimelineImage,
  type TimelineInput,
} from "@/app/admin/(protected)/progetti/actions";
import { computeProgress, phaseState } from "@/lib/projects/derive";

export interface TimelineItem {
  id: string;
  label: string;
  dateLabel: string;
  sortableDate: string | null;
  description: string;
  weight: number;
  completed: boolean;
  images: PhotoItem[];
}

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red";

function toInput(item: TimelineItem): TimelineInput {
  return {
    label: item.label,
    dateLabel: item.dateLabel,
    sortableDate: item.sortableDate,
    description: item.description,
    weight: item.weight,
    completed: item.completed,
  };
}

export default function TimelineManager({
  projectId,
  initialItems,
}: {
  projectId: string;
  initialItems: TimelineItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const progress = computeProgress(items);
  const { current } = phaseState(items);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    }
  };

  const handleAdd = () =>
    run(async () => {
      if (!draftLabel.trim()) return;
      setAdding(true);
      try {
        const input: TimelineInput = { label: draftLabel, dateLabel: "", sortableDate: draftDate || null, description: "", weight: 1, completed: false };
        const { id, dateLabel } = await createTimelineEvent(projectId, input, items.length);
        setItems((prev) => [...prev, { id, ...input, label: input.label.trim(), dateLabel, images: [] }]);
        setDraftLabel("");
        setDraftDate("");
      } finally {
        setAdding(false);
      }
    });

  /** Local edit only; persisted on blur (text) or immediately (checkbox, selects). */
  const edit = (id: string, changes: Partial<TimelineItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));

  const save = (id: string, changes: Partial<TimelineItem> = {}) =>
    run(async () => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const merged = { ...item, ...changes };
      if (!merged.label.trim()) throw new Error("Il titolo della fase non può essere vuoto.");
      edit(id, changes);
      setSavingId(id);
      try {
        const { dateLabel } = await updateTimelineEvent(id, toInput(merged));
        edit(id, { dateLabel });
      } finally {
        setSavingId(null);
      }
    });

  const handleDelete = (id: string, label: string) =>
    run(async () => {
      if (!confirm(`Eliminare la fase "${label}"?`)) return;
      await deleteTimelineEvent(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });

  const handleDragEnd = (event: DragEndEvent) =>
    run(async () => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      await reorderTimelineEvents(reordered.map((i) => i.id));
    });

  return (
    <div className="max-w-3xl">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-600">
        <p>
          Sul sito l&apos;avanzamento viene calcolato dalle fasi segnate come completate, tenendo conto del loro peso.
          La <strong>fase attuale</strong> è la prima non completata. Trascina le fasi per riordinarle.
        </p>
        {progress !== null && (
          <p className="mt-2 text-slate-900">
            Ora il sito mostra: <strong>{progress}%</strong>
            {current ? <> · fase attuale <strong>{current.label}</strong></> : " · lavori completati"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-2 mb-6">
        <input value={draftLabel} onChange={(e) => setDraftLabel(e.target.value)} placeholder="Nuova fase (es. Inizio lavori)" className={inputCls} />
        <input type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} className={inputCls} aria-label="Data della fase" />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !draftLabel.trim()}
          className="flex items-center justify-center gap-1.5 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Aggiungi
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nessuna fase ancora. Sul sito comparirà: &quot;Il cantiere non è ancora partito. Qui troverai tutti gli aggiornamenti&quot;.
        </p>
      ) : (
        <DndContext id={`timeline-${projectId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => {
                const open = openId === item.id;
                return (
                  <SortableItem key={item.id} id={item.id}>
                    <div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => save(item.id, { completed: e.target.checked })}
                          className="w-4 h-4 accent-crg-red shrink-0"
                          title="Fase completata"
                          aria-label={`Fase "${item.label}" completata`}
                        />
                        <input
                          value={item.label}
                          onChange={(e) => edit(item.id, { label: e.target.value })}
                          onBlur={() => save(item.id)}
                          className="flex-1 min-w-0 text-sm text-slate-800 bg-transparent focus:outline-none"
                          aria-label="Titolo fase"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">{item.dateLabel}</span>
                        {savingId === item.id && <span className="text-[11px] text-slate-400">Salvo…</span>}
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : item.id)}
                          className="text-slate-500 hover:text-slate-900 p-1 shrink-0 flex items-center gap-1 text-xs"
                          aria-expanded={open}
                        >
                          Dettagli <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.label)}
                          className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                          aria-label="Elimina fase"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {open && (
                        <div className="mt-4 pl-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="block text-xs text-slate-500 mb-1">Data (calendario)</span>
                            <input
                              type="date"
                              value={item.sortableDate ?? ""}
                              onChange={(e) => save(item.id, { sortableDate: e.target.value || null })}
                              className={inputCls}
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-slate-500 mb-1">Data come appare sul sito (facoltativo)</span>
                            <input
                              value={item.dateLabel}
                              onChange={(e) => edit(item.id, { dateLabel: e.target.value })}
                              onBlur={() => save(item.id)}
                              placeholder="Es. Primavera 2027"
                              className={inputCls}
                            />
                          </label>
                          <label className="block sm:col-span-2">
                            <span className="block text-xs text-slate-500 mb-1">Racconto della fase (visibile sul sito)</span>
                            <textarea
                              rows={3}
                              value={item.description}
                              onChange={(e) => edit(item.id, { description: e.target.value })}
                              onBlur={() => save(item.id)}
                              placeholder="Es. Abbiamo completato il getto del secondo solaio…"
                              className={`${inputCls} resize-y`}
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-slate-500 mb-1">Peso sull&apos;avanzamento</span>
                            <select
                              value={item.weight}
                              onChange={(e) => save(item.id, { weight: Number(e.target.value) })}
                              className={`${inputCls} bg-white`}
                            >
                              {[1, 2, 3, 4, 5].map((w) => (
                                <option key={w} value={w}>
                                  {w === 1 ? "1 (normale)" : w === 5 ? "5 (fase molto lunga)" : w}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="sm:col-span-2">
                            <span className="block text-xs text-slate-500 mb-2">Foto della fase</span>
                            <PhotoStrip
                              items={item.images}
                              onAdd={async (media) => {
                                await run(async () => {
                                  const { id } = await addTimelineImage(item.id, media.id, item.images.length);
                                  edit(item.id, { images: [...item.images, { id, media: { url: media.url, original_filename: media.original_filename } }] });
                                });
                              }}
                              onRemove={async (imageId) => {
                                await run(async () => {
                                  await removeTimelineImage(imageId);
                                  edit(item.id, { images: item.images.filter((i) => i.id !== imageId) });
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
