export type UnitStatus = "available" | "optioned" | "sold" | "rented" | "reserved";
export type CarBoxStatus = "available" | "optioned" | "sold";
export type ProjectCategory = "residential" | "commercial" | "industrial";
export type ProjectStatus = "for-sale" | "under-construction" | "coming-soon" | "for-rent";

export interface UnitFloorplan {
  id: string;
  url: string;
  filename: string;
  kind: "image" | "pdf" | "video" | "document";
}

export interface ProjectUnit {
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
  label: string;
  date: string;
  completed: boolean;
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
  spotlightSpecs: ProjectSpec[];
  carBoxPlanUrl: string;
  carBoxes: CarBox[];
}
