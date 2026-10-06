"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { FileText, Plus, Trash2 } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import {
  createProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  reorderProjectDocuments,
  type ProjectDocumentInput,
} from "@/app/admin/(protected)/progetti/actions";
import type { MediaLibraryItem } from "@/lib/types/media";

type Category = ProjectDocumentInput["category"];

export const documentCategoryOptions: { value: Category; label: string }[] = [
  { value: "brochure", label: "Brochure" },
  { value: "capitolato", label: "Capitolato" },
  { value: "planimetrie", label: "Planimetrie" },
  { value: "energetica", label: "Classe energetica" },
  { value: "box", label: "Box auto" },
  { value: "altro", label: "Altro" },
];

export interface DocumentItem {
  id: string;
  category: Category;
  title: string;
  requiresContact: boolean;
  isActive: boolean;
  filename: string;
  url: string;
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red";

export default function DocumentsManager({ projectId, initialItems }: { projectId: string; initialItems: DocumentItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    }
  };

  const edit = (id: string, changes: Partial<DocumentItem>) =>
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));

  const save = (id: string, changes: Partial<DocumentItem> = {}) =>
    run(async () => {
      const item = items.find((d) => d.id === id);
      if (!item) return;
      const merged = { ...item, ...changes };
      edit(id, changes);
      await updateProjectDocument(id, {
        category: merged.category,
        title: merged.title,
        requiresContact: merged.requiresContact,
        isActive: merged.isActive,
      });
    });

  const handleSelect = (media: MediaLibraryItem) =>
    run(async () => {
      const title = media.original_filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
      const input: ProjectDocumentInput = { mediaId: media.id, category: "altro", title, requiresContact: false, isActive: true };
      const { id } = await createProjectDocument(projectId, input, items.length);
      setItems((prev) => [...prev, { id, category: "altro", title, requiresContact: false, isActive: true, filename: media.original_filename, url: media.url }]);
    });

  const handleDragEnd = (event: DragEndEvent) =>
    run(async () => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const reordered = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id));
      setItems(reordered);
      await reorderProjectDocuments(reordered.map((i) => i.id));
    });

  return (
    <div className="max-w-4xl">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-600">
        I documenti compaiono nella sezione &quot;Documenti&quot; del progetto, raggruppati per categoria. Con
        <strong> &quot;Su richiesta&quot;</strong> il visitatore deve lasciare nome ed email per scaricarlo: la richiesta arriva in
        <strong> Richieste</strong>.
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg mb-6"
      >
        <Plus className="w-4 h-4" /> Aggiungi documento
      </button>
      <MediaLibraryModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} kindFilter={["pdf", "document", "image"]} />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessun documento. Finché è vuota, la sezione non compare sul sito.</p>
      ) : (
        <DndContext id={`documents-${projectId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((d) => (
                <SortableItem key={d.id} id={d.id}>
                  <div className={`flex flex-wrap items-center gap-3 ${d.isActive ? "" : "opacity-60"}`}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" title={d.filename} className="text-slate-400 hover:text-crg-red">
                      <FileText className="w-4 h-4" />
                    </a>
                    <input
                      value={d.title}
                      onChange={(e) => edit(d.id, { title: e.target.value })}
                      onBlur={() => save(d.id)}
                      className={`${inputCls} flex-1 min-w-[180px]`}
                      aria-label="Titolo documento"
                    />
                    <select value={d.category} onChange={(e) => save(d.id, { category: e.target.value as Category })} className={`${inputCls} bg-white`} aria-label="Categoria">
                      {documentCategoryOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 whitespace-nowrap">
                      <input type="checkbox" checked={d.requiresContact} onChange={(e) => save(d.id, { requiresContact: e.target.checked })} className="w-4 h-4 accent-crg-red" />
                      Su richiesta
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 whitespace-nowrap">
                      <input type="checkbox" checked={d.isActive} onChange={(e) => save(d.id, { isActive: e.target.checked })} className="w-4 h-4 accent-crg-red" />
                      Attivo
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        run(async () => {
                          if (!confirm(`Togliere "${d.title}" dal progetto? Il file resta nella Media Library.`)) return;
                          await deleteProjectDocument(d.id);
                          setItems((prev) => prev.filter((x) => x.id !== d.id));
                        })
                      }
                      className="p-1 text-slate-400 hover:text-red-600"
                      aria-label="Rimuovi documento"
                    >
                      <Trash2 className="w-4 h-4" />
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
