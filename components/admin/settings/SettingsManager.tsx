"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { upsertSetting, deleteSetting } from "@/app/admin/(protected)/impostazioni/actions";
import type { SettingItem } from "@/lib/admin/data/settings";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface Props {
  initialSettings: SettingItem[];
}

export default function SettingsManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSave = async (key: string) => {
    const value = drafts[key] ?? settings.find((s) => s.key === key)?.value ?? "";
    setSavingKey(key);
    setError("");
    try {
      await upsertSetting(key, value);
      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Eliminare l'impostazione "${key}"?`)) return;
    try {
      await deleteSetting(key);
      setSettings((prev) => prev.filter((s) => s.key !== key));
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await upsertSetting(newKey, newValue);
      setSettings((prev) => [
        ...prev.filter((s) => s.key !== newKey.trim()),
        { key: newKey.trim(), value: newValue, updatedAt: new Date().toISOString() },
      ].sort((a, b) => a.key.localeCompare(b.key)));
      setNewKey("");
      setNewValue("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Impostazioni</h1>
        <p className="text-sm text-slate-500 mt-1">
          Parametri chiave/valore generali del sito (es. ID Google Analytics, numero di telefono di fallback, modalità manutenzione).
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">{error}</p>}

      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row gap-4 sm:items-end max-w-2xl">
        <div className="flex-1">
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Chiave</label>
          <input
            required
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="google_analytics_id"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red font-mono"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Valore</label>
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-2 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Aggiungi
        </button>
      </form>

      {settings.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-slate-700">Nessuna impostazione ancora</p>
          <p className="text-sm text-slate-500 mt-1">Aggiungi la prima chiave/valore dal modulo qui sopra.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-medium text-slate-500 px-5 py-3">Chiave</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Valore</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Aggiornato</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.key} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-4 font-mono text-slate-700">{s.key}</td>
                  <td className="px-5 py-4">
                    <input
                      value={drafts[s.key] ?? s.value}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-crg-red"
                    />
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDateTime(s.updatedAt)}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleSave(s.key)}
                      disabled={savingKey === s.key}
                      className="text-xs text-crg-red hover:text-crg-red-dark font-medium mr-4 disabled:opacity-50"
                    >
                      {savingKey === s.key ? "Salvataggio..." : "Salva"}
                    </button>
                    <button onClick={() => handleDelete(s.key)} className="text-slate-400 hover:text-red-600" aria-label="Elimina">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
