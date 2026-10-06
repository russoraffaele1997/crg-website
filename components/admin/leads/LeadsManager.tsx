"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Mail, Phone } from "lucide-react";
import { updateLead } from "@/app/admin/(protected)/richieste/actions";
import type { AdminLead, LeadStatus, LeadTypeValue } from "@/lib/admin/data/leads";

const statusOptions: { value: LeadStatus; label: string; cls: string }[] = [
  { value: "new", label: "Nuova", cls: "bg-crg-red-light text-crg-red border-crg-red/30" },
  { value: "contacted", label: "Contattato", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "visit_scheduled", label: "Visita fissata", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "closed", label: "Chiusa", cls: "bg-slate-100 text-slate-500 border-slate-200" },
];

const typeLabels: Record<LeadTypeValue, string> = {
  appointment: "Appuntamento",
  contact: "Contatto",
  notify: "Avvisami",
  document: "Documento",
};

const timeLabels: Record<string, string> = {
  morning: "mattina",
  afternoon: "pomeriggio",
  evening: "tardo pomeriggio",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function toCsv(leads: AdminLead[]): string {
  const header = ["Data", "Tipo", "Stato", "Nome", "Cognome", "Email", "Telefono", "Progetto", "Unità", "Box", "Documento", "Messaggio", "Note"];
  const esc = (v: string | null) => `"${(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const rows = leads.map((l) =>
    [
      formatDateTime(l.createdAt), typeLabels[l.type], statusOptions.find((s) => s.value === l.status)?.label ?? l.status,
      l.firstName, l.lastName, l.email, l.phone, l.projectTitle, l.unit, l.carBox, l.document, l.message, l.notes,
    ].map(esc).join(";")
  );
  return "﻿" + [header.map(esc).join(";"), ...rows].join("\n");
}

const selectCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-crg-red";

export default function LeadsManager({
  leads: initialLeads,
  projects,
  filters,
}: {
  leads: AdminLead[];
  projects: { id: string; title: string }[];
  filters: { status: string; projectId: string; type: string };
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const setFilter = (key: "stato" | "progetto" | "tipo", value: string) => {
    const params = new URLSearchParams({
      ...(filters.status && { stato: filters.status }),
      ...(filters.projectId && { progetto: filters.projectId }),
      ...(filters.type && { tipo: filters.type }),
    });
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/richieste${params.size ? `?${params}` : ""}`);
  };

  const save = async (id: string, changes: { status?: LeadStatus; notes?: string }) => {
    setError("");
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));
    try {
      await updateLead(id, changes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    }
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `richieste-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={filters.status} onChange={(e) => setFilter("stato", e.target.value)} className={selectCls} aria-label="Filtra per stato">
          <option value="">Tutti gli stati</option>
          {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setFilter("tipo", e.target.value)} className={selectCls} aria-label="Filtra per tipo">
          <option value="">Tutti i tipi</option>
          {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.projectId} onChange={(e) => setFilter("progetto", e.target.value)} className={selectCls} aria-label="Filtra per progetto">
          <option value="">Tutti i progetti</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <span className="text-sm text-slate-500">{leads.length} richieste</span>
        {leads.length > 0 && (
          <button type="button" onClick={exportCsv} className="ml-auto flex items-center gap-2 text-sm text-slate-700 border border-slate-300 rounded-lg px-3 py-2 hover:border-crg-red hover:text-crg-red">
            <Download className="w-4 h-4" /> Esporta per Excel
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {leads.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-slate-700">Nessuna richiesta {filters.status || filters.type || filters.projectId ? "con questi filtri" : "ancora"}</p>
          <p className="text-sm text-slate-500 mt-1">Le richieste inviate dai moduli del sito compariranno qui.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {leads.map((l) => {
            const status = statusOptions.find((s) => s.value === l.status) ?? statusOptions[0];
            const open = openId === l.id;
            return (
              <div key={l.id} className={l.status === "new" ? "bg-crg-red-light/30" : ""}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                  <button type="button" onClick={() => setOpenId(open ? null : l.id)} className="flex-1 min-w-[220px] text-left" aria-expanded={open}>
                    <p className="text-sm font-medium text-slate-900">
                      {l.firstName} {l.lastName}
                      <span className="ml-2 text-xs font-normal text-slate-500">{typeLabels[l.type]}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDateTime(l.createdAt)}
                      {l.projectTitle && <> · {l.projectTitle}</>}
                      {l.unit && <> · {l.unit}</>}
                      {l.document && <> · {l.document}</>}
                    </p>
                  </button>
                  <a href={`mailto:${l.email}`} className="text-slate-400 hover:text-crg-red" title={l.email} aria-label={`Scrivi a ${l.email}`}>
                    <Mail className="w-4 h-4" />
                  </a>
                  {l.phone && (
                    <a href={`tel:${l.phone.replace(/\s+/g, "")}`} className="text-slate-400 hover:text-crg-red" title={l.phone} aria-label={`Chiama ${l.phone}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <select
                    value={l.status}
                    onChange={(e) => save(l.id, { status: e.target.value as LeadStatus })}
                    className={`text-xs font-medium border rounded-full px-3 py-1 ${status.cls}`}
                    aria-label="Stato richiesta"
                  >
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                {open && (
                  <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <dl className="space-y-1.5">
                      <div><dt className="inline text-slate-500">Email: </dt><dd className="inline"><a href={`mailto:${l.email}`} className="text-crg-red hover:underline">{l.email}</a></dd></div>
                      {l.phone && <div><dt className="inline text-slate-500">Telefono: </dt><dd className="inline">{l.phone}</dd></div>}
                      {l.carBox && <div><dt className="inline text-slate-500">Box auto: </dt><dd className="inline">{l.carBox}</dd></div>}
                      {(l.preferredDay || l.preferredTime) && (
                        <div>
                          <dt className="inline text-slate-500">Preferenza visita: </dt>
                          <dd className="inline">
                            {l.preferredDay ? new Date(`${l.preferredDay}T12:00:00`).toLocaleDateString("it-IT") : ""}
                            {l.preferredTime ? ` ${timeLabels[l.preferredTime] ?? l.preferredTime}` : ""}
                          </dd>
                        </div>
                      )}
                      {l.subject && <div><dt className="inline text-slate-500">Oggetto: </dt><dd className="inline">{l.subject}</dd></div>}
                      {l.message && <p className="text-slate-700 whitespace-pre-line mt-3 bg-slate-50 rounded-lg p-3">{l.message}</p>}
                    </dl>
                    <label className="block">
                      <span className="block text-xs text-slate-500 mb-1">Note interne (non visibili al cliente)</span>
                      <textarea
                        rows={4}
                        defaultValue={l.notes}
                        onBlur={(e) => e.target.value !== l.notes && save(l.id, { notes: e.target.value })}
                        placeholder="Es. Richiamato il 7/10, interessato anche al box B3"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red resize-y"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
