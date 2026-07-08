import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getBlockDefinition } from "@/lib/content/block-registry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBlockData<T extends Record<string, any>>(page: string, blockKey: string): Promise<T> {
  const def = getBlockDefinition(page, blockKey);
  const fallback = (def?.defaultData ?? {}) as T;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("site_content_blocks")
    .select("data")
    .eq("page", page)
    .eq("block_key", blockKey)
    .eq("publish_status", "published")
    .maybeSingle();

  if (!data?.data) return fallback;
  // Shallow-merge so a block field added to the registry later (without a
  // matching DB row yet) still renders with its default instead of undefined.
  return { ...fallback, ...data.data } as T;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  body: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  stats: StatItem[];
}
export async function getHeroContent(): Promise<HeroContent> {
  return getBlockData("home", "hero");
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
}
export interface WhatWeDoContent {
  eyebrow: string;
  title: string;
  services: ServiceItem[];
}
export async function getWhatWeDoContent(): Promise<WhatWeDoContent> {
  return getBlockData("home", "what_we_do");
}

export interface FeatureItem {
  title: string;
  description: string;
}
export interface WhyCrgContent {
  eyebrow: string;
  title: string;
  intro: string;
  features: FeatureItem[];
}
export async function getWhyCrgContent(): Promise<WhyCrgContent> {
  return getBlockData("home", "why_crg");
}

export interface PalazzoRueSpotlightContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  paragraph1: string;
  paragraph2: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  badge: string;
  specs: StatItem[];
  availabilityLabel: string;
  availabilityNote: string;
}
export async function getPalazzoRueSpotlightContent(): Promise<PalazzoRueSpotlightContent> {
  return getBlockData("home", "palazzo_rue_spotlight");
}

export interface FinalCtaContent {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
}
export async function getHomeFinalCtaContent(): Promise<FinalCtaContent> {
  return getBlockData("home", "final_cta");
}

export interface ParallaxPhase {
  tag: string;
  title: string;
  sub: string;
}
export interface ConstructionParallaxContent {
  phases: ParallaxPhase[];
}
export async function getConstructionParallaxContent(): Promise<ConstructionParallaxContent> {
  return getBlockData("home", "construction_parallax");
}

export interface AboutHeroContent {
  eyebrow: string;
  titleLine1: string;
  titleAccent: string;
  body: string;
}
export async function getAboutHeroContent(): Promise<AboutHeroContent> {
  return getBlockData("chi-siamo", "hero");
}

export interface AboutMissionContent {
  eyebrow: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}
export async function getAboutMissionContent(): Promise<AboutMissionContent> {
  return getBlockData("chi-siamo", "mission");
}

export interface TitledDescriptionItem {
  title: string;
  description: string;
}
export interface AboutValuesContent {
  eyebrow: string;
  title: string;
  items: TitledDescriptionItem[];
}
export async function getAboutValuesContent(): Promise<AboutValuesContent> {
  return getBlockData("chi-siamo", "values");
}

export interface NumberedStepItem {
  number: string;
  title: string;
  description: string;
}
export interface AboutProcessContent {
  eyebrow: string;
  title: string;
  steps: NumberedStepItem[];
}
export async function getAboutProcessContent(): Promise<AboutProcessContent> {
  return getBlockData("chi-siamo", "process");
}

export interface SimpleCtaContent {
  title: string;
  body: string;
  ctaLabel: string;
}
export async function getAboutCtaContent(): Promise<SimpleCtaContent> {
  return getBlockData("chi-siamo", "cta");
}

export interface CompanyInfoContent {
  brandDescription: string;
  address: string;
  email: string;
  phone: string;
  hoursWeekday: string;
  hoursSaturday: string;
}
export async function getCompanyInfoContent(): Promise<CompanyInfoContent> {
  return getBlockData("global", "company_info");
}

export interface ContactHeroContent {
  eyebrow: string;
  title: string;
  body: string;
}
export async function getContactHeroContent(): Promise<ContactHeroContent> {
  return getBlockData("contatti", "hero");
}

export async function getContactFinalCtaContent(): Promise<SimpleCtaContent> {
  return getBlockData("contatti", "final_cta");
}
