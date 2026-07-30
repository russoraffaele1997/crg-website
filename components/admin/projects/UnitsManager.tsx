"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, FileImage, Car } from "lucide-react";
import UnitStatusSelect from "./UnitStatusSelect";
import CarBoxStatusSelect from "./CarBoxStatusSelect";
import UnitDocumentsPanel from "./UnitDocumentsPanel";
import MediaField from "@/components/admin/MediaField";
import {
  createUnit,
  updateUnit,
  deleteUnit,
  updateCarBoxPlan,
  createCarBox,
  updateCarBox,
  deleteCarBox,
  type UnitInput,
} from "@/app/admin/(protected)/progetti/actions";
import type { UnitStatus, CarBoxStatus } from "@/lib/types/project";
import type { MediaLibraryItem } from "@/lib/types/media";

interface Unit {
  id: string;
  unitCode: string;
  name: string;
  typology: string;
  floor: string | null;
  interno: string | null;
  sqm: number;
  outdoorSqm: number | null;
  rooms: string | null;
  destination: string | null;
  price: string | null;
  status: string;
  description: string | null;
}

interface CarBox {
  id: string;
  name: string;
  sqm: number;
  status: string;
}

const typologyOptions = ["Appartamento", "Attico", "Attico e Superattico", "ERS", "Locale commerciale"];
const floorOptions = ["Piano Terra", ...Array.from({ length: 15 }, (_, i) => `Piano ${i + 1}`)];
const roomsOptions = ["1", "2", "3", "4", "5", "6"];

/** Dropdown that still shows the currently stored value even if it predates
 * this preset list (e.g. legacy free-text data), instead of silently
 * discarding it. */
function PresetSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const allOptions = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red bg-white"
    >
      <option value="">{placeholder}</option>
      {allOptions.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

const emptyForm: UnitInput = {
  unitCode: "",
  name: "",
  typology: "",
  floor: "",
  interno: "",
  sqm: 0,
  outdoorSqm: null,
  rooms: "",
  destination: "",
  price: "",
  status: "available",
  description: "",
};

function UnitFields({
  value,
  onChange,
}: {
  value: UnitInput;
  onChange: (next: UnitInput) => void;
}) {
  const set = <K extends keyof UnitInput>(key: K, v: UnitInput[K]) => onChange({ ...value, [key]: v });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <input placeholder="Codice (A01)" value={value.unitCode} onChange={(e) => set("unitCode", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Nome" value={value.name} onChange={(e) => set("name", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <PresetSelect value={value.typology} onChange={(v) => set("typology", v)} options={typologyOptions} placeholder="Tipologia" />
      <PresetSelect value={value.floor} onChange={(v) => set("floor", v)} options={floorOptions} placeholder="Piano" />
      <input placeholder="Interno" value={value.interno} onChange={(e) => set("interno", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input type="number" placeholder="Mq" value={value.sqm || ""} onChange={(e) => set("sqm", Number(e.target.value))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input type="number" placeholder="Mq esterni" value={value.outdoorSqm ?? ""} onChange={(e) => set("outdoorSqm", e.target.value ? Number(e.target.value) : null)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <PresetSelect value={value.rooms} onChange={(v) => set("rooms", v)} options={roomsOptions} placeholder="Vani" />
      <input placeholder="Destinazione" value={value.destination} onChange={(e) => set("destination", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Prezzo" value={value.price} onChange={(e) => set("price", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <textarea
        placeholder="Descrizione (mostrata nel popup dell'immobile sul sito)"
        value={value.description}
        onChange={(e) => set("description", e.target.value)}
        rows={2}
        className="col-span-2 sm:col-span-4 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red resize-none"
      />
    </div>
  );
}

function CarBoxManager({
  projectId,
  initialPlan,
  initialBoxes,
}: {
  projectId: string;
  initialPlan: MediaLibraryItem | null;
  initialBoxes: CarBox[];
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [boxes, setBoxes] = useState(initialBoxes);
  const [adding, setAdding] = useState(false);
  const [newBox, setNewBox] = useState({ name: "", sqm: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBox, setEditBox] = useState({ name: "", sqm: 0 });
  const [saving, setSaving] = useState(false);

  const handlePlanChange = async (media: MediaLibraryItem | null) => {
    setPlan(media);
    await updateCarBoxPlan(projectId, media?.id ?? null);
  };

  const handleAdd = async () => {
    if (!newBox.name.trim()) return;
    setSaving(true);
    await createCarBox(projectId, newBox, boxes.length);
    setBoxes((prev) => [...prev, { id: crypto.randomUUID(), status: "available" as CarBoxStatus, ...newBox }]);
    setNewBox({ name: "", sqm: 0 });
    setAdding(false);
    setSaving(false);
  };

  const startEdit = (box: CarBox) => {
    setEditingId(box.id);
    setEditBox({ name: box.name, sqm: box.sqm });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    await updateCarBox(editingId, projectId, editBox);
    setBoxes((prev) => prev.map((b) => (b.id === editingId ? { ...b, ...editBox } : b)));
    setEditingId(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo box auto?")) return;
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    await deleteCarBox(id, projectId);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
      <div className="mb-4">
        <MediaField label="Planimetria generale box auto" value={plan} onChange={handlePlanChange} kindFilter={["image", "pdf"]} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-700">{boxes.length} box auto</p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuovo box auto
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 flex flex-wrap gap-2">
          <input
            placeholder="Nome (es. Box auto 1)"
            value={newBox.name}
            onChange={(e) => setNewBox((b) => ({ ...b, name: e.target.value }))}
            className="flex-1 min-w-[160px] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
          />
          <input
            type="number"
            placeholder="Mq"
            value={newBox.sqm || ""}
            onChange={(e) => setNewBox((b) => ({ ...b, sqm: Number(e.target.value) }))}
            className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || !newBox.name.trim()}
            className="bg-crg-red hover:bg-crg-red-dark text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Aggiungi
          </button>
          <button type="button" onClick={() => setAdding(false)} className="text-sm text-slate-500 px-2">
            Annulla
          </button>
        </div>
      )}

      {boxes.length === 0 ? (
        <p className="text-sm text-slate-500">Nessun box auto ancora.</p>
      ) : (
        <div className="space-y-2">
          {boxes.map((box) =>
            editingId === box.id ? (
              <div key={box.id} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap gap-2">
                <input
                  value={editBox.name}
                  onChange={(e) => setEditBox((b) => ({ ...b, name: e.target.value }))}
                  className="flex-1 min-w-[160px] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
                />
                <input
                  type="number"
                  value={editBox.sqm || ""}
                  onChange={(e) => setEditBox((b) => ({ ...b, sqm: Number(e.target.value) }))}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
                />
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-crg-red hover:bg-crg-red-dark text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-sm text-slate-500 px-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div key={box.id} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-slate-800">
                  {box.name} <span className="text-slate-400">— {box.sqm} mq</span>
                </span>
                <div className="flex items-center gap-2">
                  <CarBoxStatusSelect carBoxId={box.id} projectId={projectId} status={box.status as CarBoxStatus} />
                  <button type="button" onClick={() => startEdit(box)} className="text-slate-400 hover:text-slate-700 p-1.5" aria-label="Modifica">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(box.id)} className="text-slate-400 hover:text-red-600 p-1.5" aria-label="Elimina">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function UnitsManager({
  projectId,
  initialUnits,
  initialCarBoxPlan,
  initialCarBoxes,
}: {
  projectId: string;
  initialUnits: Unit[];
  initialCarBoxPlan: MediaLibraryItem | null;
  initialCarBoxes: CarBox[];
}) {
  const [units, setUnits] = useState(initialUnits);
  const [adding, setAdding] = useState(false);
  const [newUnit, setNewUnit] = useState<UnitInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUnit, setEditUnit] = useState<UnitInput>(emptyForm);
  const [docsUnit, setDocsUnit] = useState<Unit | null>(null);
  const [carBoxPanelOpen, setCarBoxPanelOpen] = useState(false);

  const handleAdd = async () => {
    if (!newUnit.unitCode.trim() || !newUnit.name.trim()) return;
    setSaving(true);
    await createUnit(projectId, newUnit, units.length);
    setUnits((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...newUnit },
    ]);
    setNewUnit(emptyForm);
    setAdding(false);
    setSaving(false);
  };

  const startEdit = (unit: Unit) => {
    setEditingId(unit.id);
    setEditUnit({
      unitCode: unit.unitCode,
      name: unit.name,
      typology: unit.typology,
      floor: unit.floor ?? "",
      interno: unit.interno ?? "",
      sqm: unit.sqm,
      outdoorSqm: unit.outdoorSqm,
      rooms: unit.rooms ?? "",
      destination: unit.destination ?? "",
      price: unit.price ?? "",
      status: unit.status as UnitStatus,
      description: unit.description ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    await updateUnit(editingId, projectId, editUnit);
    setUnits((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...editUnit } : u)));
    setEditingId(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo appartamento?")) return;
    setUnits((prev) => prev.filter((u) => u.id !== id));
    await deleteUnit(id, projectId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{units.length} appartamenti</p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Nuovo appartamento
        </button>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => setCarBoxPanelOpen((v) => !v)}
          className="flex items-center gap-1.5 border border-slate-300 text-slate-700 text-sm px-3 py-2 rounded-lg hover:border-crg-red hover:text-crg-red transition-colors"
        >
          <Car className="w-4 h-4" />
          Box auto
        </button>
        {carBoxPanelOpen && (
          <div className="mt-3">
            <CarBoxManager projectId={projectId} initialPlan={initialCarBoxPlan} initialBoxes={initialCarBoxes} />
          </div>
        )}
      </div>

      {adding && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <UnitFields value={newUnit} onChange={setNewUnit} />
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !newUnit.unitCode.trim() || !newUnit.name.trim()}
              className="bg-crg-red hover:bg-crg-red-dark text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Aggiungi
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-slate-500 px-4 py-2">
              Annulla
            </button>
          </div>
        </div>
      )}

      {units.length === 0 ? (
        <p className="text-sm text-slate-500">Nessun appartamento ancora.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-medium text-slate-500 px-4 py-3">Unità</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Tipologia</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Piano/Int.</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Mq</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Prezzo</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Stato</th>
                <th className="text-right font-medium text-slate-500 px-4 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) =>
                editingId === u.id ? (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 bg-slate-50">
                    <td colSpan={7} className="px-4 py-4">
                      <UnitFields value={editUnit} onChange={setEditUnit} />
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={saving}
                          className="flex items-center gap-1.5 bg-crg-red hover:bg-crg-red-dark text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Salva
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 text-sm text-slate-500 px-4 py-2"
                        >
                          <X className="w-4 h-4" />
                          Annulla
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{u.name}</span>
                      <p className="text-xs text-slate-400">{u.unitCode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.typology}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {[u.floor, u.interno].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.sqm} mq{u.outdoorSqm ? ` + ${u.outdoorSqm} mq est.` : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.price || "—"}</td>
                    <td className="px-4 py-3">
                      <UnitStatusSelect unitId={u.id} status={u.status as UnitStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDocsUnit(u)}
                          className="text-slate-400 hover:text-slate-700 p-1.5"
                          aria-label="Planimetrie e documenti"
                          title="Planimetrie e documenti"
                        >
                          <FileImage className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          className="text-slate-400 hover:text-slate-700 p-1.5"
                          aria-label="Modifica"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5"
                          aria-label="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {docsUnit && (
        <UnitDocumentsPanel
          unitId={docsUnit.id}
          unitName={docsUnit.name}
          open={!!docsUnit}
          onClose={() => setDocsUnit(null)}
        />
      )}
    </div>
  );
}
