export type UnitStatus = "available" | "optioned" | "sold" | "rented" | "reserved";
export type CarBoxStatus = "available" | "optioned" | "sold";
export type ProjectCategory = "residential" | "commercial" | "industrial";
export type ProjectStatus = "for-sale" | "under-construction" | "coming-soon" | "for-rent";
export type AlertTone = "info" | "success" | "warning";
export type DocumentCategory = "capitolato" | "brochure" | "planimetrie" | "energetica" | "box" | "altro";

export interface UnitFloorplan {
  id: string;
  url: string;
  filename: string;
  kind: "image" | "pdf" | "video" | "document";
}

export interface ProjectUnit {
  /** Public-facing unit code (e.g. "A01"), not the database UUID. */
  id: string;
  name: string;
  typology: string;
  floor?: string;
  interno?: string;
  sqm: number;
  outdoorSqm?: number;
  rooms?: string;
  destination?: string;
  price?: string;
  status: UnitStatus;
  description?: string;
  floorplans: UnitFloorplan[];
  photos: UnitFloorplan[];
}

export interface ProjectTimelineItem {
  id: string;
  label: string;
  date: string;
  /** ISO date (yyyy-mm-dd) when the admin set a real date. */
  sortableDate: string | null;
  completed: boolean;
  weight: number;
  description: string | null;
  images: string[];
}

export interface ProjectUpdate {
  id: string;
  publishedOn: string;
  title: string;
  body: string | null;
  images: string[];
}

export interface ProjectDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  requiresContact: boolean;
  /** Empty for documents released only after the visitor leaves a contact. */
  url: string;
  filename: string;
}

export interface ProjectPartner {
  id: string;
  name: string;
  role: string;
  logoUrl: string;
  website: string | null;
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface CarBox {
  id: string;
  name: string;
  sqm: number;
  status: CarBoxStatus;
}

/** Admin-controlled messaging shown on the public page (next action + alerts). */
export interface ProjectMessaging {
  expectedDelivery: string | null;
  expectedDeliveryLabel: string | null;
  nextActionText: string | null;
  nextActionExpiresOn: string | null;
  nextActionHidden: boolean;
  lowStockThreshold: number;
  autoAlertsEnabled: boolean;
  alertText: string | null;
  alertTone: AlertTone | null;
  alertExpiresOn: string | null;
}

export interface Project extends ProjectMessaging {
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
  spotlightSpecs: ProjectSpec[];
  carBoxPlanUrl: string;
  carBoxes: CarBox[];
  updates: ProjectUpdate[];
  documents: ProjectDocument[];
  partners: ProjectPartner[];
}

export interface UnitCounts {
  total: number;
  available: number;
  optioned: number;
  /** Sold, rented or reserved: no longer on the market. */
  closed: number;
}

/** Lightweight shape for cards, header/footer menus and the sitemap. */
export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  status: ProjectStatus;
  statusLabel: string;
  shortDescription: string;
  coverImage: string;
  units: UnitCounts;
  priceFrom: string | null;
  progress: number | null;
  deliveryLabel: string | null;
  lowStock: boolean;
  recentUpdate: boolean;
}
