"use client";

import { useState } from "react";
import { updateProjectMessaging, type ProjectMessagingInput } from "@/app/admin/(protected)/progetti/actions";
import { nextAction, projectAlerts, todayIso } from "@/lib/projects/derive";
import type { ProjectCategory, ProjectStatus, UnitCounts } from "@/lib/types/project";

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red";

const toneLabels = { info: "Informazione (blu)", success: "Buona notizia (verde)", warning: "Attenzione (arancio)" } as const;

export default function MessagingForm({
  projectId,
  initial,
  category,
  status,
  counts,
  latestUpdate,
}: {
  projectId: string;
  initial: ProjectMessagingInput;
  category: ProjectCategory;
  status: ProjectStatus;
  counts: UnitCounts;
  latestUpdate: string | null;
}) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const set = <K extends keyof ProjectMessagingInput>(key: K, value: ProjectMessagingInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  };

  // Live preview using exactly the rules the public page uses.
  const today = todayIso();
  const messaging = {
    ...form,
    expectedDelivery: null,
    expectedDeliveryLabel: null,
    nextActionText: form.nextActionText || null,
    alertText: form.alertText || null,
  };
  const preview = nextAction({ category, status, counts, messaging, today });
  const alerts = projectAlerts({ messaging, latestUpdate, today });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    setError("");
    try {
      await updateProjectMessaging(projectId, form);
      setState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
      setState("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">&quot;Cosa puoi fare adesso&quot;</h2>
        <p className="text-xs text-slate-500 mb-4">
          È il riquadro più evidente della pagina. Di base si calcola da solo in base alle unità disponibili. Puoi sostituirlo
          con un messaggio tuo (es. un open day) fino a una data.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
          <label className="block">
            <span className="block text-xs text-slate-500 mb-1">Messaggio personalizzato (facoltativo)</span>
            <input value={form.nextActionText} onChange={(e) => set("nextActionText", e.target.value)} placeholder="Es. Open day sabato 12 ottobre, dalle 10 alle 18" className={inputCls} />
          </label>
          <label className="block">
            <span className="block text-xs text-slate-500 mb-1">Valido fino al</span>
            <input type="date" value={form.nextActionExpiresOn ?? ""} onChange={(e) => set("nextActionExpiresOn", e.target.value || null)} className={inputCls} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <label className="block">
            <span className="block text-xs text-slate-500 mb-1">&quot;Ultime unità&quot; quando le disponibili sono al massimo</span>
            <input type="number" min={0} max={20} value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", Number(e.target.value))} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:pt-5">
            <input type="checkbox" checked={form.nextActionHidden} onChange={(e) => set("nextActionHidden", e.target.checked)} className="w-4 h-4 accent-crg-red" />
            Nascondi questo riquadro
          </label>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Anteprima di oggi</p>
          {preview ? (
            <p className="text-slate-900">
              <strong>{preview.title}</strong> <span className="text-slate-500">→ pulsante &quot;{preview.cta.label}&quot;</span>
            </p>
          ) : (
            <p className="text-slate-500">Riquadro nascosto.</p>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Avvisi in cima alla pagina</h2>
        <p className="text-xs text-slate-500 mb-4">Al massimo due alla volta: prima il tuo, poi quello automatico sull&apos;ultimo aggiornamento del diario (per 14 giorni).</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
          <label className="block">
            <span className="block text-xs text-slate-500 mb-1">Avviso manuale (facoltativo)</span>
            <input value={form.alertText} onChange={(e) => set("alertText", e.target.value)} placeholder="Es. Consegna confermata per giugno 2027" className={inputCls} />
          </label>
          <label className="block">
            <span className="block text-xs text-slate-500 mb-1">Tipo</span>
            <select value={form.alertTone} onChange={(e) => set("alertTone", e.target.value as ProjectMessagingInput["alertTone"])} className={`${inputCls} bg-white`}>
              {Object.entries(toneLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs text-slate-500 mb-1">Valido fino al</span>
            <input type="date" value={form.alertExpiresOn ?? ""} onChange={(e) => set("alertExpiresOn", e.target.value || null)} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:pt-5">
            <input type="checkbox" checked={form.autoAlertsEnabled} onChange={(e) => set("autoAlertsEnabled", e.target.checked)} className="w-4 h-4 accent-crg-red" />
            Avviso automatico per i nuovi aggiornamenti
          </label>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Anteprima di oggi</p>
          {alerts.length === 0 ? (
            <p className="text-slate-500">Nessun avviso visibile.</p>
          ) : (
            <ul className="space-y-1">{alerts.map((a) => <li key={a.text} className="text-slate-900">• {a.text}</li>)}</ul>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      <button type="submit" disabled={state === "saving"} className="bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-50">
        {state === "saving" ? "Salvataggio…" : state === "saved" ? "Salvato ✓" : "Salva messaggi"}
      </button>
    </form>
  );
}
