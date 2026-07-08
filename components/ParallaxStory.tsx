"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";

const phases = [
  {
    number: "01",
    tag: "Acquisizione",
    title: "Dal terreno\nalla visione",
    description:
      "Ogni grande progetto inizia con un'analisi attenta del territorio e una visione chiara del potenziale.",
    bg: "#2C1F14",
    accent: "#7A5C40",
  },
  {
    number: "02",
    tag: "Cantiere",
    title: "Demolizione\ne preparazione",
    description:
      "Costruiamo il futuro sulle basi del passato. Ogni area viene bonificata e preparata con cura.",
    bg: "#1E1E1E",
    accent: "#505050",
  },
  {
    number: "03",
    tag: "Fondazioni",
    title: "Strutture\nantisismiche",
    description:
      "Fondazioni certificate e strutture ingegnerizzate per resistere al tempo e garantire sicurezza.",
    bg: "#252520",
    accent: "#606050",
  },
  {
    number: "04",
    tag: "Costruzione",
    title: "Materiali di\nultima generazione",
    description:
      "Selezioniamo i migliori materiali sul mercato per garantire durabilità, comfort e sostenibilità.",
    bg: "#1A2028",
    accent: "#405060",
  },
  {
    number: "05",
    tag: "Finiture",
    title: "Efficienza\nenergetica",
    description:
      "Classe energetica A+, zero emissioni operative e tecnologie smart per abitare in modo responsabile.",
    bg: "#141C18",
    accent: "#304838",
  },
  {
    number: "06",
    tag: "Completamento",
    title: "Spazi moderni\ne sostenibili",
    description:
      "Residenze, uffici e spazi industriali pensati per durare, per la qualità della vita, per il futuro.",
    bg: "#181410",
    accent: "#483C28",
  },
];

interface PhaseSlideProps {
  phase: (typeof phases)[0];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

function PhaseSlide({
  phase,
  index,
  total,
  scrollYProgress,
}: PhaseSlideProps) {
  const start = index / total;
  const end = (index + 1) / total;
  const mid = (start + end) / 2;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.07, end - 0.07, end],
    [0, 1, 1, 0]
  );

  const y = useTransform(scrollYProgress, [start, end], ["3%", "-3%"]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden={index !== 0}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: phase.bg }}
      />
      {/* Decorative geometric element */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${phase.accent} 100%)`,
        }}
      />
      <div
        className="absolute left-0 bottom-0 w-48 h-48 rounded-full opacity-5 blur-3xl"
        style={{ backgroundColor: phase.accent }}
      />

      <motion.div
        style={{ y }}
        className="relative z-10 text-center px-8 max-w-3xl"
      >
        <span className="inline-block font-sans text-[10px] tracking-[0.45em] uppercase text-white/30 mb-8">
          {phase.tag}
        </span>
        <div
          className="font-serif text-[100px] md:text-[160px] leading-none font-bold select-none mb-0 pointer-events-none"
          style={{ color: phase.accent, opacity: 0.12 }}
        >
          {phase.number}
        </div>
        <h2
          className="font-serif text-3xl md:text-5xl lg:text-[56px] font-light text-white leading-[1.15] -mt-8 md:-mt-14 mb-6 whitespace-pre-line"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
        >
          {phase.title}
        </h2>
        <p className="font-sans text-sm md:text-base text-white/50 leading-relaxed max-w-lg mx-auto">
          {phase.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ParallaxStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${phases.length * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {phases.map((phase, index) => (
          <PhaseSlide
            key={phase.number}
            phase={phase}
            index={index}
            total={phases.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* Phase indicator dots */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
          {phases.map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-white/20"
              style={{
                height: 20,
                scaleY: useTransform(
                  scrollYProgress,
                  [i / phases.length, (i + 1) / phases.length],
                  [1, 1.5]
                ),
                backgroundColor: useTransform(
                  scrollYProgress,
                  [
                    i / phases.length - 0.05,
                    i / phases.length,
                    (i + 1) / phases.length,
                    (i + 1) / phases.length + 0.05,
                  ],
                  [
                    "rgba(255,255,255,0.15)",
                    "rgba(196,160,100,0.9)",
                    "rgba(196,160,100,0.9)",
                    "rgba(255,255,255,0.15)",
                  ]
                ),
              }}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
          }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/30">
              Scorri
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          style={{ scaleX: progressScale }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold origin-left z-20"
        />
      </div>
    </div>
  );
}
