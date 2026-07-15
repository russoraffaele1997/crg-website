import type { Metadata } from "next";
import { getPageSeo } from "@/lib/data/seo";
import { buildMetadata } from "@/lib/seo/build-metadata";
import HeroSection from "@/components/HeroSection";
import ConstructionParallax from "@/components/home/ConstructionParallax";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import WhyCRGSection from "@/components/WhyCRGSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import ProjectSpotlightSection from "@/components/home/ProjectSpotlightSection";
import FinalCTA from "@/components/FinalCTA";
import { getFeaturedProjects, getSpotlightProject } from "@/lib/data/projects";
import {
  getHeroContent,
  getConstructionParallaxContent,
  getWhatWeDoContent,
  getWhyCrgContent,
  getHomeFinalCtaContent,
} from "@/lib/data/site-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/");
  return buildMetadata(seo, {
    title: "CRG | Crafted Residential Group — Sviluppo Immobiliare Premium",
    description:
      "Dal terreno al valore. CRG sviluppa progetti immobiliari residenziali, commerciali e industriali in Italia.",
  });
}

export default async function HomePage() {
  const [featured, hero, parallax, whatWeDo, whyCrg, spotlightProject, finalCta] = await Promise.all([
    getFeaturedProjects(3),
    getHeroContent(),
    getConstructionParallaxContent(),
    getWhatWeDoContent(),
    getWhyCrgContent(),
    getSpotlightProject(),
    getHomeFinalCtaContent(),
  ]);

  return (
    <>
      <HeroSection content={hero} projects={featured} />
      <ConstructionParallax content={parallax} />
      <FeaturedProjects featured={featured} />
      <WhatWeDoSection content={whatWeDo} />
      <WhyCRGSection content={whyCrg} />
      {spotlightProject && <ProjectSpotlightSection project={spotlightProject} />}
      <FinalCTA content={finalCta} />
    </>
  );
}
