export type UnitStatus = "available" | "optioned" | "sold" | "rented";
export type ProjectCategory = "residential" | "commercial" | "industrial";
export type ProjectStatus = "for-sale" | "under-construction" | "coming-soon" | "for-rent";

export interface ProjectUnit {
  id: string;
  name: string;
  typology: string;
  floor?: string;
  sqm: number;
  outdoorSqm?: number;
  rooms?: string;
  destination?: string;
  price?: string;
  status: UnitStatus;
}

export interface ProjectTimelineItem {
  label: string;
  date: string;
  completed: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  status: ProjectStatus;
  statusLabel: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  gallery: string[];
  highlights: string[];
  technicalFeatures: string[];
  timeline: ProjectTimelineItem[];
  units: ProjectUnit[];
  totalUnits: number;
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "palazzo-rue",
    title: "Palazzo Rue",
    location: "Casoria, NA",
    category: "residential",
    status: "for-sale",
    statusLabel: "In vendita",
    shortDescription:
      "Residenza esclusiva a Casoria (NA): cinque unità di pregio con finiture su misura e classe energetica NZEB.",
    description:
      "Palazzo Rue è un intervento di recupero e valorizzazione di un edificio storico nel centro di Casoria (NA). Il progetto restituisce alla città cinque unità residenziali di alto profilo, ciascuna caratterizzata da piante ampie, altezze generose e finiture selezionate con cura artigianale. L'attico al quinto e sesto piano, con terrazzo panoramico da 260 mq, rappresenta il punto di eccellenza dell'intero sviluppo. Ogni appartamento è progettato per rispettare i più alti standard energetici, raggiungendo la classificazione NZEB (Nearly Zero Energy Building).",
    coverImage: "/images/projects/palazzo-rue/cover.jpg",
    gallery: [
      "/images/projects/palazzo-rue/gallery-1.jpg",
      "/images/projects/palazzo-rue/gallery-2.jpg",
      "/images/projects/palazzo-rue/gallery-3.jpg",
      "/images/projects/palazzo-rue/gallery-4.jpg",
    ],
    highlights: [
      "Posizione centrale nel cuore di Casoria (NA)",
      "Classe energetica NZEB certificata",
      "Finiture artigianali su misura",
      "Attico con terrazzo panoramico da 260 mq",
      "Struttura antisismica di nuova generazione",
      "Domotica integrata in ogni unità",
    ],
    technicalFeatures: [
      "Struttura in cemento armato antisismico",
      "Isolamento a cappotto ad alta prestazione",
      "Pompa di calore aria-acqua inverter",
      "Ventilazione meccanica controllata (VMC)",
      "Serramenti a triplo vetro basso emissivo",
      "Impianto fotovoltaico dedicato",
      "Domotica KNX integrata",
      "Fibra ottica FTTH in ogni appartamento",
    ],
    timeline: [
      { label: "Acquisizione immobile", date: "Ottobre 2023", completed: true },
      { label: "Progettazione esecutiva", date: "Febbraio 2024", completed: true },
      { label: "Permessi edilizi", date: "Giugno 2024", completed: true },
      { label: "Inizio lavori", date: "Settembre 2024", completed: true },
      { label: "Fine lavori prevista", date: "Marzo 2026", completed: false },
      { label: "Consegna prevista", date: "Giugno 2026", completed: false },
    ],
    units: [
      {
        id: "A01",
        name: "Appartamento A01",
        typology: "Quadrilocale",
        floor: "Piano 1",
        sqm: 109,
        rooms: "5",
        price: "Riservato",
        status: "sold",
      },
      {
        id: "B01",
        name: "Appartamento B01",
        typology: "Quadrilocale",
        floor: "Piano 2",
        sqm: 109,
        rooms: "5",
        price: "Riservato",
        status: "sold",
      },
      {
        id: "C03",
        name: "Appartamento C03",
        typology: "Quadrilocale",
        floor: "Piano 3",
        sqm: 109,
        rooms: "5",
        price: "Riservato",
        status: "sold",
      },
      {
        id: "D04",
        name: "Appartamento D04",
        typology: "Quadrilocale",
        floor: "Piano 4",
        sqm: 109,
        rooms: "5",
        price: "Riservato",
        status: "sold",
      },
      {
        id: "E05",
        name: "Attico E05",
        typology: "Attico con terrazzo",
        floor: "Piano 5-6",
        sqm: 105,
        outdoorSqm: 260,
        rooms: "5",
        price: "Riservato",
        status: "available",
      },
    ],
    totalUnits: 5,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(count = 3): Project[] {
  return projects.slice(0, count);
}
