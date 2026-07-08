"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, X, Save, History } from "lucide-react";
import SortableItem from "@/components/admin/SortableItem";
import BlockHistory from "./BlockHistory";
import { saveBlock } from "@/app/admin/(protected)/contenuti/actions";
import type { FieldSpec, SimpleField, ArrayField } from "@/lib/content/block-registry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockData = Record<string, any>;

function SimpleFieldEditor({
  field,
  value,
  onChange,
}: {
  field: SimpleField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none"
        />
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
        />
      )}
    </div>
  );
}

function ArrayItemFields({
  field,
  item,
  onChange,
}: {
  field: ArrayField;
  item: BlockData;
  onChange: (item: BlockData) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
      {field.fields.map((sub) => (
        <SimpleFieldEditor
          key={sub.key}
          field={sub}
          value={item[sub.key]}
          onChange={(v) => onChange({ ...item, [sub.key]: v })}
        />
      ))}
    </div>
  );
}

function ArrayFieldEditor({
  field,
  value,
  onChange,
}: {
  field: ArrayField;
  value: BlockData[];
  onChange: (value: BlockData[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const items = value ?? [];

  const emptyItem = () =>
    Object.fromEntries(field.fields.map((f) => [f.key, ""]));

  if (field.fixedLength) {
    return (
      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-3">{field.label}</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-xs text-slate-400 mt-2.5 w-16 shrink-0">{field.itemLabel} {i + 1}</span>
              <ArrayItemFields
                field={field}
                item={item}
                onChange={(next) => {
                  const copy = [...items];
                  copy[i] = next;
                  onChange(copy);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs tracking-wider uppercase text-slate-500">{field.label}</label>
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem()])}
          className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi {field.itemLabel.toLowerCase()}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400">Nessuna voce.</p>
      ) : (
        <DndContext id={`content-${field.key}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, i) => (
                <SortableItem key={i} id={String(i)}>
                  <div className="flex items-start gap-3">
                    <ArrayItemFields
                      field={field}
                      item={item}
                      onChange={(next) => {
                        const copy = [...items];
                        copy[i] = next;
                        onChange(copy);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-red-600 p-1 mt-2 shrink-0"
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

export default function BlockForm({
  page,
  blockKey,
  fields,
  initialData,
}: {
  page: string;
  blockKey: string;
  fields: FieldSpec[];
  initialData: BlockData;
}) {
  const [data, setData] = useState<BlockData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const setField = (key: string, value: unknown) => setData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveBlock(page, blockKey, data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="space-y-6 mb-8">
        {fields.map((field) =>
          field.type === "array" ? (
            <ArrayFieldEditor
              key={field.key}
              field={field}
              value={data[field.key] ?? []}
              onChange={(v) => setField(field.key, v)}
            />
          ) : (
            <SimpleFieldEditor
              key={field.key}
              field={field}
              value={data[field.key]}
              onChange={(v) => setField(field.key, v)}
            />
          )
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}
      {saved && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4">Modifiche salvate.</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </button>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-4 py-2.5"
        >
          <History className="w-4 h-4" />
          Cronologia
        </button>
      </div>

      <BlockHistory
        page={page}
        blockKey={blockKey}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestored={(restoredData) => {
          setData(restoredData);
          setHistoryOpen(false);
          setSaved(true);
        }}
      />
    </div>
  );
}
