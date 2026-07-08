"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import UnitStatusSelect from "./UnitStatusSelect";
import { createUnit, updateUnit, deleteUnit, type UnitInput } from "@/app/admin/(protected)/progetti/actions";
import type { UnitStatus } from "@/lib/types/project";

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
      <input placeholder="Tipologia" value={value.typology} onChange={(e) => set("typology", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Piano" value={value.floor} onChange={(e) => set("floor", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Interno" value={value.interno} onChange={(e) => set("interno", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input type="number" placeholder="Mq" value={value.sqm || ""} onChange={(e) => set("sqm", Number(e.target.value))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input type="number" placeholder="Mq esterni" value={value.outdoorSqm ?? ""} onChange={(e) => set("outdoorSqm", e.target.value ? Number(e.target.value) : null)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Vani" value={value.rooms} onChange={(e) => set("rooms", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Destinazione" value={value.destination} onChange={(e) => set("destination", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
      <input placeholder="Prezzo" value={value.price} onChange={(e) => set("price", e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red" />
    </div>
  );
}

export default function UnitsManager({
  projectId,
  initialUnits,
}: {
  projectId: string;
  initialUnits: Unit[];
}) {
  const [units, setUnits] = useState(initialUnits);
  const [adding, setAdding] = useState(false);
  const [newUnit, setNewUnit] = useState<UnitInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUnit, setEditUnit] = useState<UnitInput>(emptyForm);

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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
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
    </div>
  );
}
