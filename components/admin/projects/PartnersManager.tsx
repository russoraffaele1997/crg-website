"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import {
  createProjectPartner,
  updateProjectPartner,
  deleteProjectPartner,
  reorderProjectPartners,
} from "@/app/admin/(protected)/progetti/actions";

export interface PartnerItem {
  id: string;
  name: string;
  role: string;
  website: string;
  logo: { id: string; url: string } | null;
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red";
const ROLE_SUGGESTIONS = ["Progettista", "Impresa costruttrice", "Direttore dei lavori", "Strutturista", "Agenzia commerciale"];

export default function PartnersManager({ projectId, initialItems }: { projectId: string; initialItems: PartnerItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState({ name: "", role: "" });
  const [logoPickerFor, setLogoPickerFor] = useState<string | null>(null);
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

  const edit = (id: string, changes: Partial<PartnerItem>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));

  const save = (id: string, changes: Partial<PartnerItem> = {}) =>
    run(async () => {
      const item = items.find((p) => p.id === id);
      if (!item) return;
      const merged = { ...item, ...changes };
      edit(id, changes);
      await updateProjectPartner(id, { name: merged.name, role: merged.role, website: merged.website, logoMediaId: merged.logo?.id ?? null });
    });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { id } = await createProjectPartner(projectId, { ...draft, website: "", logoMediaId: null }, items.length);
      setItems((prev) => [...prev, { id, name: draft.name.trim(), role: draft.role.trim(), website: "", logo: null }]);
      setDraft({ name: "", role: "" });
    });
  };

  const handleDragEnd = (event: DragEndEvent) =>
    run(async () => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const reordered = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id));
      setItems(reordered);
      await reorderProjectPartners(reordered.map((i) => i.id));
    });

  return (
    <div className="max-w-4xl">
      <p className="text-sm text-slate-600 mb-6">
        Chi progetta, costruisce e dirige i lavori. Sul sito compare il riquadro &quot;Chi realizza il progetto&quot;: dà fiducia a chi
        sta valutando l&apos;acquisto. Se l&apos;elenco è vuoto, il riquadro non compare.
      </p>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-6">
        <input required value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nome (es. Studio Rossi Architetti)" className={inputCls} />
        <input required list="partner-roles" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} placeholder="Ruolo (es. Progettista)" className={inputCls} />
        <datalist id="partner-roles">
          {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
        </datalist>
        <button type="submit" disabled={!draft.name.trim() || !draft.role.trim()} className="flex items-center justify-center gap-1.5 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40">
          <Plus className="w-4 h-4" /> Aggiungi
        </button>
      </form>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {items.length > 0 && (
        <DndContext id={`partners-${projectId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((p) => (
                <SortableItem key={p.id} id={p.id}>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLogoPickerFor(p.id)}
                      className="w-12 h-12 rounded-md border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0"
                      title="Scegli logo"
                    >
                      {p.logo ? <img src={p.logo.url} alt="" className="w-full h-full object-contain" /> : <ImagePlus className="w-4 h-4 text-slate-400" />}
                    </button>
                    <input value={p.name} onChange={(e) => edit(p.id, { name: e.target.value })} onBlur={() => save(p.id)} className={`${inputCls} flex-1 min-w-[160px]`} aria-label="Nome" />
                    <input value={p.role} onChange={(e) => edit(p.id, { role: e.target.value })} onBlur={() => save(p.id)} list="partner-roles" className={`${inputCls} w-44`} aria-label="Ruolo" />
                    <input value={p.website} onChange={(e) => edit(p.id, { website: e.target.value })} onBlur={() => save(p.id)} placeholder="Sito web (facoltativo)" className={`${inputCls} w-52`} aria-label="Sito web" />
                    {p.logo && (
                      <button type="button" onClick={() => save(p.id, { logo: null })} className="text-xs text-slate-500 hover:text-red-600">
                        Togli logo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        run(async () => {
                          if (!confirm(`Togliere "${p.name}"?`)) return;
                          await deleteProjectPartner(p.id);
                          setItems((prev) => prev.filter((x) => x.id !== p.id));
                        })
                      }
                      className="p-1 text-slate-400 hover:text-red-600"
                      aria-label="Elimina"
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

      <MediaLibraryModal
        open={logoPickerFor !== null}
        onClose={() => setLogoPickerFor(null)}
        kindFilter="image"
        onSelect={(media) => {
          if (logoPickerFor) save(logoPickerFor, { logo: { id: media.id, url: media.url } });
          setLogoPickerFor(null);
        }}
      />
    </div>
  );
}
