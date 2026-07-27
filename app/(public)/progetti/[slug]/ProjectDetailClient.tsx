"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import type { Project, ProjectUnit, CarBox } from "@/lib/types/project";
import ClientImage from "@/components/ClientImage";

const categoryGradients: Record<string, string> = {
  residential: "from-stone-400 to-stone-600",
  commercial:  "from-slate-400 to-slate-600",
  industrial:  "from-zinc-400 to-zinc-600",
};

const unitStatusConfig: Record<string, { label: string; cls: string }> = {
  available: { label: "Disponibile", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  optioned:  { label: "Opzionata",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  sold:      { label: "Venduta",     cls: "bg-red-50 text-red-700 border-red-200" },
  rented:    { label: "Affittata",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  reserved:  { label: "Riservata",   cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

// ─── Gallery ─────────────────────────────────────────────────────────────────
function Gallery({ images, title, category }: { images: string[]; title: string; category: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className={`relative overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-crg-red ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
          >
            <ClientImage
              src={src} alt={`${title} — foto ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              fallbackClass={`w-full h-full bg-gradient-to-br ${categoryGradients[category]}`}
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white font-sans text-sm tracking-widest uppercase" onClick={() => setLightbox(null)}>
            Chiudi ✕
          </button>
          <ClientImage
            src={images[lightbox]} alt={`${title} — foto ${lightbox + 1}`}
            className="max-w-4xl w-full max-h-[80vh] object-contain"
            fallbackClass={`w-96 h-64 bg-gradient-to-br ${categoryGradients[category]}`}
          />
        </div>
      )}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ items }: { items: Project["timeline"] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border-warm" />
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-6 pl-12 pb-8 relative">
          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${item.completed ? "bg-crg-red border-crg-red" : "bg-cream border-border-warm"}`}>
            {item.completed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mb-1">{item.date}</div>
            <div className={`font-sans text-base ${item.completed ? "text-charcoal font-medium" : "text-mid-gray"}`}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Car box picker popup ───────────────────────────────────────────────────
function CarBoxPickerModal({
  planUrl,
  boxes,
  selectedId,
  onConfirm,
  onClose,
}: {
  planUrl: string;
  boxes: CarBox[];
  selectedId: string | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}) {
  const [pending, setPending] = useState<string | null>(selectedId);

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white max-w-xl w-full max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-5 text-mid-gray hover:text-charcoal font-sans text-sm tracking-widest uppercase z-10"
          onClick={onClose}
        >
          Chiudi ✕
        </button>

        <div className="p-8 sm:p-10">
          <h3 className="font-heading text-2xl font-bold text-charcoal mb-1">Scegli il box auto</h3>
          <p className="font-sans text-sm text-mid-gray mb-6">Seleziona il posto auto che preferisci.</p>

          {planUrl && (
            <a
              href={planUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-2 font-sans text-sm text-crg-red hover:underline mb-6"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Scarica la planimetria dei box auto
            </a>
          )}

          <div className="space-y-2 mb-8">
            {boxes.map((box) => (
              <label
                key={box.id}
                className={`flex items-center justify-between gap-4 border px-4 py-3 cursor-pointer transition-colors ${
                  pending === box.id ? "border-crg-red bg-crg-red-light" : "border-border-warm hover:bg-cream"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="car-box"
                    checked={pending === box.id}
                    onChange={() => setPending(box.id)}
                    className="w-4 h-4 accent-crg-red"
                  />
                  <span className="font-sans text-sm font-medium text-charcoal">{box.name}</span>
                </span>
                <span className="font-sans text-sm text-mid-gray">{box.sqm} mq</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            disabled={!pending}
            onClick={() => pending && onConfirm(pending)}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Conferma selezione
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Unit detail popup ──────────────────────────────────────────────────────
function UnitDetailModal({
  unit,
  carBoxPlanUrl,
  carBoxes,
  onClose,
  onRequestAppointment,
}: {
  unit: ProjectUnit;
  carBoxPlanUrl: string;
  carBoxes: CarBox[];
  onClose: () => void;
  onRequestAppointment: (unit: ProjectUnit, carBox: CarBox | null) => void;
}) {
  const images = unit.floorplans.filter((f) => f.kind === "image");
  const otherDocs = unit.floorplans.filter((f) => f.kind !== "image");
  const photos = unit.photos.filter((p) => p.kind === "image" || p.kind === "video");
  const [photoLightbox, setPhotoLightbox] = useState<string | null>(null);
  const [carBoxPickerOpen, setCarBoxPickerOpen] = useState(false);
  const [selectedCarBoxId, setSelectedCarBoxId] = useState<string | null>(null);
  const selectedCarBox = carBoxes.find((b) => b.id === selectedCarBoxId) ?? null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-5 text-mid-gray hover:text-charcoal font-sans text-sm tracking-widest uppercase z-10"
          onClick={onClose}
        >
          Chiudi ✕
        </button>

        <div className="p-8 sm:p-10">
          <span className={`inline-block font-sans text-[10px] tracking-wider uppercase px-3 py-1 border mb-4 ${unitStatusConfig[unit.status].cls}`}>
            {unitStatusConfig[unit.status].label}
          </span>
          <h3 className="font-heading text-3xl font-bold text-charcoal mb-1">{unit.name}</h3>
          <p className="font-sans text-sm text-mid-gray mb-6">
            {unit.typology}
            {unit.floor ? ` — Piano ${unit.floor}` : ""}
            {unit.interno ? `, int. ${unit.interno}` : ""}
          </p>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-8">
              {photos.map((photo) =>
                photo.kind === "video" ? (
                  <video
                    key={photo.id}
                    src={photo.url}
                    className="aspect-square w-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setPhotoLightbox(photo.url)}
                    className="aspect-square w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-crg-red"
                  >
                    <ClientImage
                      src={photo.url}
                      alt={`Foto ${unit.name}`}
                      className="w-full h-full object-cover"
                      fallbackClass="w-full h-full bg-light-gray"
                    />
                  </button>
                )
              )}
            </div>
          )}

          {photoLightbox && (
            <div
              className="fixed inset-0 bg-black/92 z-[60] flex items-center justify-center p-4"
              onClick={() => setPhotoLightbox(null)}
            >
              <button
                className="absolute top-6 right-6 text-white/50 hover:text-white font-sans text-sm tracking-widest uppercase"
                onClick={() => setPhotoLightbox(null)}
              >
                Chiudi ✕
              </button>
              <ClientImage
                src={photoLightbox}
                alt={`Foto ${unit.name}`}
                className="max-w-4xl w-full max-h-[80vh] object-contain"
                fallbackClass="w-96 h-64 bg-light-gray"
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 pb-8 border-b border-border-warm">
            <div>
              <div className="font-heading font-bold text-xl text-charcoal">{unit.sqm} mq</div>
              <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Mq interni</div>
            </div>
            {unit.outdoorSqm && (
              <div>
                <div className="font-heading font-bold text-xl text-charcoal">{unit.outdoorSqm} mq</div>
                <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Mq esterni</div>
              </div>
            )}
            {unit.rooms && (
              <div>
                <div className="font-heading font-bold text-xl text-charcoal">{unit.rooms}</div>
                <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Vani</div>
              </div>
            )}
            {unit.price && (
              <div>
                <div className="font-heading font-bold text-base text-crg-red whitespace-nowrap">{unit.price}</div>
                <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Prezzo</div>
              </div>
            )}
            {unit.destination && (
              <div>
                <div className="font-heading font-bold text-xl text-charcoal">{unit.destination}</div>
                <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Destinazione</div>
              </div>
            )}
          </div>

          {carBoxes.length > 0 && (
            <div className="mb-8">
              <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">
                Box auto <span className="text-crg-red">*</span>
              </h4>
              <button
                type="button"
                onClick={() => setCarBoxPickerOpen(true)}
                className={selectedCarBox ? "btn-outline" : "btn-primary"}
              >
                {selectedCarBox ? `✓ ${selectedCarBox.name} selezionato — Cambia` : "Scegli box auto"}
              </button>
              {!selectedCarBox && (
                <p className="font-sans text-xs text-mid-gray mt-2">La scelta del box auto è obbligatoria.</p>
              )}
            </div>
          )}

          {unit.description && (
            <div className="mb-8">
              <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">Descrizione</h4>
              <p className="font-sans text-[15px] text-mid-gray leading-relaxed whitespace-pre-line">{unit.description}</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="mb-8">
              <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">Planimetria</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {images.map((img) => (
                  <ClientImage
                    key={img.id}
                    src={img.url}
                    alt={`Planimetria ${unit.name}`}
                    className="w-full border border-border-warm object-contain"
                    fallbackClass="w-full h-48 bg-light-gray"
                  />
                ))}
              </div>
            </div>
          )}

          {otherDocs.length > 0 && (
            <div>
              <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">Documenti</h4>
              <div className="space-y-2">
                {otherDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-sans text-sm text-crg-red hover:underline"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6 12h-6m6 3h-6m2.25-9h-2.25m9-6l-6 6h4.5a2.25 2.25 0 012.25 2.25V19.5A2.25 2.25 0 0116.5 21.75H7.5A2.25 2.25 0 015.25 19.5V4.5A2.25 2.25 0 017.5 2.25h5.379a2.25 2.25 0 011.591.659l5.121 5.121a2.25 2.25 0 01.659 1.591z" />
                    </svg>
                    {doc.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {unit.status === "available" && (
            carBoxes.length > 0 && !selectedCarBox ? (
              <div className="mt-8">
                <button type="button" disabled className="btn-primary opacity-40 cursor-not-allowed">
                  Richiedi appuntamento
                </button>
                <p className="font-sans text-xs text-mid-gray mt-2">Scegli prima il box auto per continuare.</p>
              </div>
            ) : (
              <a
                href="#appuntamento"
                onClick={() => {
                  onRequestAppointment(unit, selectedCarBox);
                  onClose();
                }}
                className="btn-primary mt-8 inline-block"
              >
                Richiedi appuntamento
              </a>
            )
          )}
        </div>
      </div>

      {carBoxPickerOpen && (
        <CarBoxPickerModal
          planUrl={carBoxPlanUrl}
          boxes={carBoxes}
          selectedId={selectedCarBoxId}
          onConfirm={(id) => {
            setSelectedCarBoxId(id);
            setCarBoxPickerOpen(false);
          }}
          onClose={() => setCarBoxPickerOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Units table, grouped by floor ─────────────────────────────────────────
// Free-text field entered per-project by the admin ("Piano 1", "3", "T"...)
// — extract the first number as a sort key, treating a non-numeric floor
// (ground floor, usually "T") as coming before floor 1.
function floorSortKey(floor: string | undefined): number {
  if (!floor) return 999;
  const match = floor.match(/-?\d+/);
  return match ? parseInt(match[0], 10) : -1;
}

function UnitsTable({
  units,
  carBoxPlanUrl,
  carBoxes,
  onRequestAppointment,
}: {
  units: ProjectUnit[];
  carBoxPlanUrl: string;
  carBoxes: CarBox[];
  onRequestAppointment: (unit: ProjectUnit, carBox: CarBox | null) => void;
}) {
  const groups: [string, ProjectUnit[]][] = [];
  for (const unit of units) {
    const key = unit.floor ?? "Piano non specificato";
    const existing = groups.find(([floor]) => floor === key);
    if (existing) existing[1].push(unit);
    else groups.push([key, [unit]]);
  }
  groups.sort((a, b) => floorSortKey(a[0]) - floorSortKey(b[0]));

  // Prefer opening the first floor that still has availability; if every
  // floor is sold out, fall back to the first floor group.
  const defaultOpenFloor =
    groups.find(([, floorUnits]) => floorUnits.some((u) => u.status === "available"))?.[0] ??
    groups[0]?.[0];

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultOpenFloor ? [defaultOpenFloor] : []));
  const [selected, setSelected] = useState<ProjectUnit | null>(null);

  const toggle = (floor: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor);
      else next.add(floor);
      return next;
    });
  };

  return (
    <div className="border-t border-border-warm">
      {groups.map(([floor, floorUnits]) => {
        const available = floorUnits.filter((u) => u.status === "available").length;
        const total = floorUnits.length;
        const isFull = available === 0;
        const isOpen = expanded.has(floor);

        return (
          <div key={floor} className="border-b border-border-warm">
            <button
              type="button"
              onClick={() => toggle(floor)}
              className="w-full flex items-center justify-between gap-4 py-5 hover:bg-crg-red-light/40 transition-colors text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-4">
                <svg
                  className={`w-3.5 h-3.5 text-mid-gray shrink-0 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-heading text-lg font-bold text-charcoal">{floor}</span>
                <span className={`font-sans text-[11px] tracking-wider uppercase font-semibold ${isFull ? "text-red-600" : "text-emerald-700"}`}>
                  {isFull ? `Completo ${total}/${total}` : `Disponibile ${available}/${total}`}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="overflow-x-auto pb-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-warm/50">
                      {["", "Unità", "Tipologia", "Superficie", "Dettagli", "Prezzo", "Stato"].map((col, i) => (
                        <th key={i} className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray py-3 px-4 text-left">
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
                        className={`border-b border-border-warm/30 last:border-0 transition-colors cursor-pointer ${unit.status === "available" ? "hover:bg-crg-red-light" : "opacity-55"}`}
                      >
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelected(unit); }}
                            className="font-sans text-[10px] tracking-wider uppercase px-3 py-1.5 border border-crg-red text-crg-red hover:bg-crg-red hover:text-white transition-colors whitespace-nowrap"
                          >
                            Visualizza
                          </button>
                        </td>
                        <td className="font-heading text-sm font-semibold text-charcoal py-4 px-4">{unit.name}</td>
                        <td className="font-sans text-sm text-mid-gray py-4 px-4">{unit.typology}</td>
                        <td className="font-sans text-sm text-mid-gray py-4 px-4">
                          {unit.outdoorSqm
                            ? `${unit.sqm} mq int. + ${unit.outdoorSqm} mq est.`
                            : `${unit.sqm} mq`}
                        </td>
                        <td className="font-sans text-sm text-mid-gray py-4 px-4">
                          {unit.rooms ? `${unit.rooms} vani` : unit.destination ?? "—"}
                        </td>
                        <td className="font-sans text-sm text-charcoal font-medium py-4 px-4">{unit.price ?? "—"}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block font-sans text-[10px] tracking-wider uppercase px-3 py-1 border ${unitStatusConfig[unit.status].cls}`}>
                            {unitStatusConfig[unit.status].label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {selected && (
        <UnitDetailModal
          unit={selected}
          carBoxPlanUrl={carBoxPlanUrl}
          carBoxes={carBoxes}
          onClose={() => setSelected(null)}
          onRequestAppointment={onRequestAppointment}
        />
      )}
    </div>
  );
}

// ─── Appointment form ─────────────────────────────────────────────────────────
function formatUnitDetails(unit: ProjectUnit): string {
  const lines = [
    `Unità: ${unit.name} (cod. ${unit.id})`,
    `Tipologia: ${unit.typology}`,
    unit.floor ? `Piano: ${unit.floor}${unit.interno ? `, int. ${unit.interno}` : ""}` : null,
    `Superficie: ${unit.sqm} mq interni${unit.outdoorSqm ? ` + ${unit.outdoorSqm} mq esterni` : ""}`,
    unit.rooms ? `Vani: ${unit.rooms}` : null,
    unit.destination ? `Destinazione: ${unit.destination}` : null,
    unit.price ? `Prezzo: ${unit.price}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

function AppointmentForm({
  project,
  availableUnits,
  presetUnitId,
  presetCarBox,
}: {
  project: Project;
  availableUnits: ProjectUnit[];
  presetUnitId: string;
  presetCarBox: CarBox | null;
}) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    unitId: "", preferredDay: "", preferredTime: "", message: "", privacy: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (presetUnitId) setForm((f) => ({ ...f, unitId: presetUnitId }));
  }, [presetUnitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacy) { setError("Devi accettare la privacy policy."); return; }
    setSubmitting(true); setError("");
    try {
      const selectedUnit = availableUnits.find((u) => u.id === form.unitId) ?? null;
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          projectId: project.id,
          projectTitle: project.title,
          unitDetails: selectedUnit ? formatUnitDetails(selectedUnit) : null,
          carBoxDetails: presetCarBox ? `${presetCarBox.name} (${presetCarBox.sqm} mq)` : null,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError("Errore nell'invio. Riprova o contattaci direttamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-crg-red-light border border-crg-red/20 p-10 text-center">
        <svg className="w-12 h-12 text-crg-red mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Richiesta inviata</h3>
        <p className="font-sans text-sm text-mid-gray max-w-sm mx-auto">
          La tua richiesta è stata inviata correttamente. Ti ricontatteremo per confermare l&rsquo;appuntamento.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-fn" className="input-label">Nome *</label>
          <input id="ap-fn" type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input-field" placeholder="Mario" />
        </div>
        <div>
          <label htmlFor="ap-ln" className="input-label">Cognome *</label>
          <input id="ap-ln" type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input-field" placeholder="Rossi" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-em" className="input-label">Email *</label>
          <input id="ap-em" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="input-field" placeholder="mario@email.com" />
        </div>
        <div>
          <label htmlFor="ap-ph" className="input-label">Telefono</label>
          <input id="ap-ph" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input-field" placeholder="+39 333 000 0000" />
        </div>
      </div>

      <div>
        <label htmlFor="ap-proj" className="input-label">Progetto</label>
        <input id="ap-proj" type="text" readOnly value={project.title} className="input-field bg-light-gray cursor-not-allowed" />
      </div>

      {availableUnits.length > 0 && (
        <div>
          <label htmlFor="ap-unit" className="input-label">Unità di interesse</label>
          <select id="ap-unit" value={form.unitId} onChange={(e) => set("unitId", e.target.value)} className="input-field">
            <option value="">— Seleziona un&apos;unità (opzionale) —</option>
            {availableUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.typology} —{" "}
                {u.outdoorSqm
                  ? `${u.sqm} mq int. + ${u.outdoorSqm} mq est.`
                  : `${u.sqm} mq`}
                {u.price ? ` — ${u.price}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {presetCarBox && (
        <div className="flex items-center gap-2 font-sans text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Box auto selezionato: {presetCarBox.name} ({presetCarBox.sqm} mq)
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-day" className="input-label">Giorno preferito</label>
          <input id="ap-day" type="date" value={form.preferredDay} onChange={(e) => set("preferredDay", e.target.value)} className="input-field" min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <label htmlFor="ap-time" className="input-label">Fascia oraria</label>
          <select id="ap-time" value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} className="input-field">
            <option value="">— Seleziona —</option>
            <option value="morning">Mattina (09:00 – 12:00)</option>
            <option value="afternoon">Pomeriggio (14:00 – 17:00)</option>
            <option value="evening">Tardo pomeriggio (17:00 – 19:00)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ap-msg" className="input-label">Messaggio (opzionale)</label>
        <textarea id="ap-msg" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className="input-field resize-none" placeholder="Informazioni aggiuntive..." />
      </div>

      <div className="flex items-start gap-3">
        <input id="ap-prv" type="checkbox" checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)} className="mt-0.5 w-4 h-4 accent-crg-red cursor-pointer" required />
        <label htmlFor="ap-prv" className="font-sans text-xs text-mid-gray leading-relaxed cursor-pointer">
          Acconsento al trattamento dei dati personali secondo la{" "}
          <a href="#" className="underline hover:text-crg-red transition-colors">Privacy Policy</a>. Il consenso è obbligatorio.
        </label>
      </div>

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Invio in corso..." : "Invia richiesta"}
      </button>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProjectDetailClient({ project }: { project: Project }) {
  const descRef = useRef<HTMLDivElement>(null);
  const descInView = useInView(descRef, { once: true, margin: "-60px" });
  const availableUnits = project.units.filter((u) => u.status === "available");
  const [presetUnitId, setPresetUnitId] = useState("");
  const [presetCarBox, setPresetCarBox] = useState<CarBox | null>(null);

  const handleRequestAppointment = (unit: ProjectUnit, carBox: CarBox | null) => {
    setPresetUnitId(unit.id);
    setPresetCarBox(carBox);
  };

  const categoryLabels: Record<string, string> = {
    residential: "Residenziale", commercial: "Commerciale", industrial: "Industriale",
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end bg-charcoal overflow-hidden">
        <ClientImage
          src={project.coverImage} alt={project.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          fallbackClass={`absolute inset-0 w-full h-full bg-gradient-to-br ${categoryGradients[project.category]}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-crg-red" />

        <div className="container-custom relative z-10 pb-14">
          <div className="flex flex-wrap gap-3 mb-5">
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-crg-red">
              {categoryLabels[project.category]}
            </span>
            <span className="text-white/30">·</span>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/50">
              {project.statusLabel}
            </span>
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-white mb-3 leading-tight">
            {project.title}
          </h1>
          <p className="font-sans text-sm text-white/45 flex items-center gap-1.5 mb-8">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {project.location}
          </p>
          <a href="#unita-disponibili" className="btn-primary">Richiedi appuntamento</a>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-warm">
        <div className="container-custom py-4">
          <nav className="font-sans text-xs text-mid-gray flex items-center gap-2">
            <Link href="/" className="hover:text-crg-red transition-colors">Home</Link>
            <span>›</span>
            <Link href="/progetti" className="hover:text-crg-red transition-colors">Progetti</Link>
            <span>›</span>
            <span className="text-charcoal">{project.title}</span>
          </nav>
        </div>
      </div>

      {/* Gallery */}
      <section className="py-16 bg-cream">
        <div className="container-custom">
          <span className="section-label block mb-6">Gallery</span>
          <Gallery images={project.gallery} title={project.title} category={project.category} />
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-white border-t border-border-warm" ref={descRef}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={descInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7"
            >
              <span className="section-label block mb-4">Descrizione</span>
              <p className="font-sans text-[15px] text-mid-gray leading-relaxed mb-10">
                {project.description}
              </p>
              <h3 className="font-heading text-xl font-bold text-charcoal mb-5">
                Caratteristiche tecniche
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.technicalFeatures.map((f) => (
                  <li key={f} className="font-sans text-sm text-mid-gray flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-crg-red rounded-full mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={descInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-crg-red-light border border-crg-red/15 p-8">
                <h3 className="font-heading text-xl font-bold text-charcoal mb-6">Punti di forza</h3>
                <ul className="space-y-4">
                  {project.highlights.map((h) => (
                    <li key={h} className="font-sans text-sm text-charcoal flex items-start gap-3">
                      <svg className="w-4 h-4 text-crg-red mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-8 border-t border-crg-red/15 grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-heading font-bold text-3xl text-crg-red">{project.totalUnits}</div>
                    <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Unità totali</div>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-3xl text-crg-red">{availableUnits.length}</div>
                    <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Disponibili</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Units */}
      <section id="unita-disponibili" className="py-16 bg-cream border-t border-border-warm">
        <div className="container-custom">
          <span className="section-label block mb-4">Disponibilità</span>
          <h2 className="font-heading text-3xl font-bold text-charcoal mb-8">Unità disponibili</h2>
          <UnitsTable
            units={project.units}
            carBoxPlanUrl={project.carBoxPlanUrl}
            carBoxes={project.carBoxes}
            onRequestAppointment={handleRequestAppointment}
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-light-gray border-t border-border-warm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="section-label block mb-4">Avanzamento</span>
              <h2 className="font-heading text-3xl font-bold text-charcoal">Stato del progetto</h2>
              <p className="font-sans text-sm text-mid-gray mt-4 leading-relaxed">
                Dalla acquisizione fino alla consegna prevista.
              </p>
            </div>
            <div className="lg:col-span-8 lg:pl-8">
              <Timeline items={project.timeline} />
            </div>
          </div>
        </div>
      </section>

      {/* Appointment form */}
      <section id="appuntamento" className="py-16 bg-cream border-t border-border-warm">
        <div className="container-custom">
          <div className="max-w-2xl">
            <span className="section-label block mb-4">Contatto</span>
            <h2 className="font-heading text-3xl font-bold text-charcoal mb-2">Richiedi un appuntamento</h2>
            <p className="font-sans text-sm text-mid-gray mb-10 leading-relaxed">
              Compila il form per richiedere un incontro con il nostro team commerciale.
            </p>
            <AppointmentForm
              project={project}
              availableUnits={availableUnits}
              presetUnitId={presetUnitId}
              presetCarBox={presetCarBox}
            />
          </div>
        </div>
      </section>
    </>
  );
}
