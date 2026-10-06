"use client";

import { useState } from "react";
import { updateProjectDelivery } from "@/app/admin/(protected)/progetti/actions";
import { deliveryLabel } from "@/lib/projects/derive";

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red";

export default function DeliveryForm({
  projectId,
  initialDate,
  initialLabel,
}: {
  projectId: string;
  initialDate: string | null;
  initialLabel: string;
}) {
  const [date, setDate] = useState(initialDate ?? "");
  const [label, setLabel] = useState(initialLabel);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const preview = deliveryLabel({ expectedDelivery: date || null, expectedDeliveryLabel: label });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    setError("");
    try {
      await updateProjectDelivery(projectId, date || null, label);
      setState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
      setState("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl bg-white border border-slate-200 rounded-xl p-5 mb-8">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">Consegna prevista</h2>
      <p className="text-xs text-slate-500 mb-4">Compare nell&apos;intestazione del progetto, nella card e nel riquadro &quot;A che punto siamo&quot;.</p>
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Data</span>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setState("idle"); }} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Oppure testo libero (ha la precedenza)</span>
          <input value={label} onChange={(e) => { setLabel(e.target.value); setState("idle"); }} placeholder="Es. Estate 2027" className={inputCls} />
        </label>
        <button type="submit" disabled={state === "saving"} className="bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50">
          {state === "saving" ? "Salvo…" : state === "saved" ? "Salvato ✓" : "Salva"}
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Sul sito: {preview ? <strong className="text-slate-900">Consegna prevista: {preview}</strong> : "non mostrata"}
      </p>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </form>
  );
}
