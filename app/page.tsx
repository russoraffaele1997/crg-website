import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import ConstructionParallax from "@/components/home/ConstructionParallax";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import WhyCRGSection from "@/components/WhyCRGSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import PalazzoRueSection from "@/components/home/PalazzoRueSection";
import FinalCTA from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "CRG | Crafted Residential Group — Sviluppo Immobiliare Premium",
  description:
    "Dal terreno al valore. CRG sviluppa progetti immobiliari residenziali, commerciali e industriali in Italia.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ConstructionParallax />
      <WhatWeDoSection />
      <WhyCRGSection />
      <FeaturedProjects />
      <PalazzoRueSection />
      <FinalCTA />
    </>
  );
}
