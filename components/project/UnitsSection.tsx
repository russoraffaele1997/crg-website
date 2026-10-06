"use client";

import { useState } from "react";
import type { CarBox, ProjectCategory, ProjectUnit, UnitStatus } from "@/lib/types/project";
import { ANCHORS, UNIT_STATUS_PUBLIC, isSelectable, unitNoun } from "@/lib/projects/derive";
import ClientImage from "@/components/ClientImage";
import Dialog from "./Dialog";
import PhotoGrid from "./PhotoGrid";
import { useVisit } from "./VisitContext";

export const unitStatusCls: Record<UnitStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  optioned:  "bg-amber-50 text-amber-700 border-amber-200",
  sold:      "bg-red-50 text-red-700 border-red-200",
  rented:    "bg-blue-50 text-blue-700 border-blue-200",
  reserved:  "bg-purple-50 text-purple-700 border-purple-200",
};

const carBoxStatusLabel: Record<CarBox["status"], string> = {
  available: "Disponibile",
  optioned: "Prenotato",
  sold: "Venduto",
};

function StatusBadge({ status }: { status: UnitStatus }) {
  return (
    <span className={`inline-block font-sans text-[10px] tracking-wider uppercase px-3 py-1 border whitespace-nowrap ${unitStatusCls[status]}`}>
      {UNIT_STATUS_PUBLIC[status]}
    </span>
  );
}

function surface(unit: ProjectUnit): string {
  return unit.outdoorSqm ? `${unit.sqm} mq + ${unit.outdoorSqm} mq esterni` : `${unit.sqm} mq`;
}

// Free-text floor ("Piano 1", "3", "T"...): first number is the sort key, a
// non-numeric floor (ground floor, usually "T") comes before floor 1.
function floorSortKey(floor: string): number {
  if (floor === "Piano non specificato") return 999;
  const match = floor.match(/-?\d+/);
  return match ? parseInt(match[0], 10) : -1;
}

function floorTitle(floor: string): string {
  const f = floor.trim();
  if (/^(t|pt|terra|piano terra)$/i.test(f)) return "Piano terra";
  if (/^-\d+$/.test(f)) return `Piano interrato ${f.slice(1)}`;
  return /^\d+$/.test(f) ? `Piano ${f}` : f;
}

// ─── Unit detail ────────────────────────────────────────────────────────────
function UnitDetail({
  unit,
  carBoxes,
  carBoxPlanUrl,
  onClose,
}: {
  unit: ProjectUnit;
  carBoxes: CarBox[];
  carBoxPlanUrl: string;
  onClose: () => void;
}) {
  const { requestVisit } = useVisit();
  const [carBoxId, setCarBoxId] = useState("");
  const selectable = isSelectable(unit.status);
  const floorplanImages = unit.floorplans.filter((f) => f.kind === "image");
  const otherDocs = unit.floorplans.filter((f) => f.kind !== "image");
  const photos = unit.photos.filter((p) => p.kind === "image").map((p) => p.url);
  const videos = unit.photos.filter((p) => p.kind === "video");
  const openBoxes = carBoxes.filter((b) => b.status !== "sold");

  const facts = [
    { label: "Superficie interna", value: `${unit.sqm} mq` },
    unit.outdoorSqm ? { label: "Spazi esterni", value: `${unit.outdoorSqm} mq` } : null,
    unit.rooms ? { label: "Vani", value: unit.rooms } : null,
    unit.destination ? { label: "Destinazione", value: unit.destination } : null,
    unit.price ? { label: "Prezzo", value: unit.price, accent: true } : null,
  ].filter(Boolean) as { label: string; value: string; accent?: boolean }[];

  return (
    <div className="p-6 sm:p-10">
      <StatusBadge status={unit.status} />
      <h3 className="font-heading text-3xl font-bold text-charcoal mt-4 mb-1">{unit.name}</h3>
      <p className="font-sans text-sm text-mid-gray mb-6">
        {unit.typology}
        {unit.floor ? ` · ${floorTitle(unit.floor)}` : ""}
        {unit.interno ? `, interno ${unit.interno}` : ""}
      </p>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-8 pb-8 border-b border-border-warm">
        {facts.map((f) => (
          <div key={f.label}>
            <dd className={`font-heading font-bold ${f.accent ? "text-lg text-crg-red" : "text-xl text-charcoal"}`}>{f.value}</dd>
            <dt className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">{f.label}</dt>
          </div>
        ))}
      </dl>

      {unit.description && (
        <p className="font-sans text-[15px] text-mid-gray leading-relaxed whitespace-pre-line mb-8">{unit.description}</p>
      )}

      {photos.length > 0 && (
        <div className="mb-8">
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">Foto</h4>
          <PhotoGrid images={photos} alt={unit.name} />
        </div>
      )}

      {videos.map((v) => (
        <video key={v.id} src={v.url} className="w-full mb-8" controls muted playsInline />
      ))}

      {floorplanImages.length > 0 && (
        <div className="mb-8">
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">Planimetria</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {floorplanImages.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" title="Apri la planimetria a tutto schermo">
                <ClientImage
                  src={img.url}
                  alt={`Planimetria ${unit.name}`}
                  className="w-full border border-border-warm object-contain"
                  fallbackClass="w-full h-48 bg-light-gray"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {otherDocs.length > 0 && (
        <div className="mb-8 space-y-2">
          <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">Documenti</h4>
          {otherDocs.map((doc) => (
            <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="block font-sans text-sm text-crg-red hover:underline">
              ↓ {doc.filename}
            </a>
          ))}
        </div>
      )}

      {selectable ? (
        <div className="border-t border-border-warm pt-8">
          {openBoxes.length > 0 && (
            <fieldset className="mb-8">
              <legend className="font-sans text-sm font-medium text-charcoal mb-1">Ti interessa anche un box auto?</legend>
              <p className="font-sans text-xs text-mid-gray mb-4">
                È facoltativo: puoi deciderlo anche durante la visita.
                {carBoxPlanUrl && (
                  <>
                    {" "}
                    <a href={carBoxPlanUrl} target="_blank" rel="noopener noreferrer" className="text-crg-red hover:underline">
                      Vedi la planimetria dei box
                    </a>
                  </>
                )}
              </p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 border px-4 py-3 cursor-pointer ${carBoxId === "" ? "border-crg-red bg-crg-red-light" : "border-border-warm"}`}>
                  <input type="radio" name="car-box" checked={carBoxId === ""} onChange={() => setCarBoxId("")} className="w-4 h-4 accent-crg-red" />
                  <span className="font-sans text-sm text-charcoal">No, per ora non mi serve</span>
                </label>
                {openBoxes.map((box) => (
                  <label
                    key={box.id}
                    className={`flex items-center justify-between gap-4 border px-4 py-3 cursor-pointer ${carBoxId === box.id ? "border-crg-red bg-crg-red-light" : "border-border-warm hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-3">
                      <input type="radio" name="car-box" checked={carBoxId === box.id} onChange={() => setCarBoxId(box.id)} className="w-4 h-4 accent-crg-red" />
                      <span className="font-sans text-sm font-medium text-charcoal">{box.name}</span>
                      {box.status === "optioned" && (
                        <span className="font-sans text-[10px] tracking-wider uppercase px-2 py-0.5 border bg-amber-50 text-amber-700 border-amber-200">
                          {carBoxStatusLabel.optioned}
                        </span>
                      )}
                    </span>
                    <span className="font-sans text-sm text-mid-gray">{box.sqm} mq</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {unit.status === "optioned" && (
            <p className="font-sans text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
              Questa unità è già prenotata da un altro cliente, ma puoi comunque visitarla: se la prenotazione decade ti avvisiamo per primo.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              requestVisit(unit.id, carBoxId);
              onClose();
            }}
            className="btn-primary w-full sm:w-auto"
          >
            Prenota una visita per {unit.name}
          </button>
        </div>
      ) : (
        <div className="border-t border-border-warm pt-8">
          <p className="font-sans text-sm text-mid-gray mb-5">Questa unità non è più disponibile.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={onClose} className="btn-outline">Vedi le unità disponibili</button>
            <a href={ANCHORS.notify} onClick={onClose} className="btn-primary">Avvisami se si libera qualcosa</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Units list ─────────────────────────────────────────────────────────────
export default function UnitsSection({
  units,
  carBoxes,
  carBoxPlanUrl,
  category,
}: {
  units: ProjectUnit[];
  carBoxes: CarBox[];
  carBoxPlanUrl: string;
  category: ProjectCategory;
}) {
  const selectableCount = units.filter((u) => isSelectable(u.status)).length;
  const [onlyAvailable, setOnlyAvailable] = useState(selectableCount > 0);
  const [selected, setSelected] = useState<ProjectUnit | null>(null);

  if (units.length === 0) {
    return (
      <div className="bg-white border border-border-warm p-8 sm:p-10 max-w-2xl">
        <p className="font-heading text-xl font-bold text-charcoal mb-2">Stiamo definendo le unità di questo progetto</p>
        <p className="font-sans text-sm text-mid-gray leading-relaxed mb-6">
          Planimetrie e prezzi saranno pubblicati a breve. Lasciaci la tua email e ti avviseremo appena saranno disponibili.
        </p>
        <a href={ANCHORS.notify} className="btn-primary">Avvisami</a>
      </div>
    );
  }

  const visible = onlyAvailable ? units.filter((u) => isSelectable(u.status)) : units;
  const groups = new Map<string, ProjectUnit[]>();
  for (const unit of visible) {
    const key = unit.floor ?? "Piano non specificato";
    groups.set(key, [...(groups.get(key) ?? []), unit]);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => floorSortKey(a[0]) - floorSortKey(b[0]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="font-sans text-sm text-mid-gray">
          {selectableCount > 0
            ? `${selectableCount} ${unitNoun(category, selectableCount)} su ${units.length} ancora visitabili. Tocca un'unità per vedere planimetria, foto e prezzo.`
            : "Tutte le unità sono state vendute o prenotate."}
        </p>
        {selectableCount > 0 && selectableCount < units.length && (
          <label className="flex items-center gap-2 font-sans text-sm text-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-crg-red"
            />
            Nascondi le unità vendute
          </label>
        )}
      </div>

      <div className="space-y-8">
        {sortedGroups.map(([floor, floorUnits]) => {
          const all = units.filter((u) => (u.floor ?? "Piano non specificato") === floor);
          const available = all.filter((u) => u.status === "available").length;
          const optioned = all.filter((u) => u.status === "optioned").length;
          return (
            <section key={floor} aria-label={floorTitle(floor)}>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="font-heading text-lg font-bold text-charcoal">{floorTitle(floor)}</h3>
                <span className={`font-sans text-[11px] tracking-wider uppercase font-semibold ${available ? "text-emerald-700" : optioned ? "text-amber-700" : "text-mid-gray"}`}>
                  {available
                    ? `${available} su ${all.length} disponibil${available === 1 ? "e" : "i"}`
                    : optioned
                      ? "Solo unità prenotate"
                      : "Tutto venduto"}
                </span>
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block bg-white border border-border-warm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-warm">
                      {["Unità", "Tipologia", "Superficie", "Vani", "Prezzo", "Stato", ""].map((col, i) => (
                        <th key={i} scope="col" className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray py-3 px-4 text-left font-normal">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {floorUnits.map((unit) => (
                      <tr
                        key={unit.id}
                        onClick={() => setSelected(unit)}
                        className={`border-b border-border-warm/40 last:border-0 cursor-pointer transition-colors hover:bg-crg-red-light ${isSelectable(unit.status) ? "" : "opacity-60"}`}
                      >
                        <td className="font-heading text-sm font-semibold text-charcoal py-4 px-4">{unit.name}</td>
                        <td className="font-sans text-sm text-mid-gray py-4 px-4">{unit.typology}</td>
                        <td className="font-sans text-sm text-mid-gray py-4 px-4">{surface(unit)}</td>
                        <td className="font-sans text-sm text-mid-gray py-4 px-4">{unit.rooms ?? unit.destination ?? "—"}</td>
                        <td className="font-sans text-sm text-charcoal font-medium py-4 px-4 whitespace-nowrap">{unit.price ?? "Su richiesta"}</td>
                        <td className="py-4 px-4"><StatusBadge status={unit.status} /></td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelected(unit); }}
                            className="font-sans text-[10px] tracking-wider uppercase px-3 py-1.5 border border-crg-red text-crg-red hover:bg-crg-red hover:text-white transition-colors whitespace-nowrap"
                          >
                            Dettagli
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: one card per unit */}
              <ul className="md:hidden space-y-3">
                {floorUnits.map((unit) => (
                  <li key={unit.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(unit)}
                      className={`w-full text-left bg-white border border-border-warm p-4 active:bg-crg-red-light ${isSelectable(unit.status) ? "" : "opacity-60"}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="font-heading text-base font-bold text-charcoal">{unit.name}</span>
                        <StatusBadge status={unit.status} />
                      </div>
                      <p className="font-sans text-sm text-mid-gray">
                        {unit.typology} · {surface(unit)}
                        {unit.rooms ? ` · ${unit.rooms} vani` : ""}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-sans text-sm font-medium text-charcoal">{unit.price ?? "Prezzo su richiesta"}</span>
                        <span className="font-sans text-[11px] tracking-wider uppercase text-crg-red">Dettagli →</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? ""} size="lg">
        {selected && (
          <UnitDetail unit={selected} carBoxes={carBoxes} carBoxPlanUrl={carBoxPlanUrl} onClose={() => setSelected(null)} />
        )}
      </Dialog>
    </div>
  );
}
