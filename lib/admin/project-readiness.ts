import type { AdminProjectDetail } from "@/lib/admin/data/projects";

export interface ReadinessItem {
  label: string;
  done: boolean;
  /** Admin tab where the item is fixed ("" = Generale). */
  tab: string;
  hint?: string;
  /** Required items block nothing technically, but the page looks unfinished without them. */
  required: boolean;
}

const MIN_GALLERY_PHOTOS = 5;

/** "Is this project ready to be published?" — computed from real content, never a guess. */
export function projectReadiness(p: AdminProjectDetail): ReadinessItem[] {
  const withPrice = p.units.filter((u) => u.price?.trim()).length;
  const withFloorplan = p.units.filter((u) => u.hasFloorplan).length;
  return [
    { label: "Immagine di copertina", done: Boolean(p.coverImage), tab: "", required: true },
    { label: "Descrizione breve e completa", done: Boolean(p.shortDescription.trim() && p.description.trim()), tab: "", required: true },
    {
      label: `Almeno ${MIN_GALLERY_PHOTOS} foto in galleria`,
      done: p.gallery.length >= MIN_GALLERY_PHOTOS,
      tab: "gallery",
      hint: `${p.gallery.length} caricate`,
      required: true,
    },
    { label: "Punti di forza", done: p.highlights.length > 0, tab: "caratteristiche", required: false },
    {
      label: "Unità inserite, tutte con prezzo",
      done: p.units.length > 0 && withPrice === p.units.length,
      tab: "unita",
      hint: p.units.length ? `${withPrice} su ${p.units.length} con prezzo` : "nessuna unità",
      required: true,
    },
    {
      label: "Planimetria per ogni unità",
      done: p.units.length > 0 && withFloorplan === p.units.length,
      tab: "unita",
      hint: p.units.length ? `${withFloorplan} su ${p.units.length}` : undefined,
      required: false,
    },
    { label: "Fasi del cantiere", done: p.timeline.length > 0, tab: "timeline", required: true },
    { label: "Fasi con data", done: p.timeline.length > 0 && p.timeline.every((t) => t.sortableDate || t.dateLabel.trim()), tab: "timeline", required: false },
    { label: "Consegna prevista", done: Boolean(p.messaging.expectedDelivery || p.messaging.expectedDeliveryLabel.trim()), tab: "timeline", required: false },
    { label: "Capitolato o brochure", done: p.documents.some((d) => d.isActive && (d.category === "capitolato" || d.category === "brochure")), tab: "documenti", required: false },
    { label: "Chi realizza il progetto", done: p.partners.length > 0, tab: "chi-realizza", required: false },
  ];
}
