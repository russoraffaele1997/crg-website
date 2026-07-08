"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import type { ConstructionParallaxContent } from "@/lib/data/site-content";

// ─── Scene geometry constants ──────────────────────────────────────────────
// All values are in SVG user units (viewBox 0 0 1200 680)
const SCENE = { W: 1200, H: 680 };
const GROUND = 590;      // y of ground line

// Building anchor point — centered horizontally, rises from GROUND up
const B = {
  x: 440,   // left edge
  y: 175,   // top edge (completed building)
  w: 320,   // width
  get h() { return GROUND - this.y; }, // 415 — full height
  floors: 9,
  bays: 4,
};

const FLOOR_H = B.h / B.floors;       // ~46 px per floor
const BAY_W   = B.w / B.bays;         // 80 px per bay

// Pre-compute column x positions (bays + 1 edges)
const COLS = Array.from({ length: B.bays + 1 }, (_, i) => B.x + i * BAY_W);

// Pre-compute beam y positions (floors + 1 edges)
const BEAMS = Array.from({ length: B.floors + 1 }, (_, i) => B.y + i * FLOOR_H);

// Pre-compute window rects
interface WinRect { x: number; y: number; w: number; h: number }
const WINDOWS: WinRect[] = [];
for (let f = 0; f < B.floors; f++) {
  for (let b = 0; b < B.bays; b++) {
    WINDOWS.push({
      x: B.x + b * BAY_W + 12,
      y: B.y + f * FLOOR_H + 10,
      w: BAY_W - 24,
      h: FLOOR_H - 18,
    });
  }
}

// ─── Phase scroll ranges ────────────────────────────────────────────────────
// Fixed animation timing, not admin-editable — only the tag/title/sub text
// (see lib/content/block-registry.ts "construction_parallax" block, passed
// in as `content` below) is. The count must stay 6 to match this array.
const PHASE_RANGES: { range: [number, number] }[] = [
  { range: [0.00, 0.14] },
  { range: [0.17, 0.31] },
  { range: [0.33, 0.47] },
  { range: [0.50, 0.63] },
  { range: [0.66, 0.79] },
  { range: [0.83, 0.97] },
];

interface Phase {
  range: [number, number];
  tag: string;
  title: string;
  sub: string;
}

// ─── Phase text component ─────────────────────────────────────────────────
function PhaseText({
  phase,
  scrollYProgress,
}: {
  phase: Phase;
  scrollYProgress: MotionValue<number>;
}) {
  const [start, end] = phase.range;
  const fade = 0.05;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [start, start + fade * 2], [18, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute left-6 md:left-14 top-1/2 -translate-y-1/2 max-w-xs md:max-w-sm pointer-events-none"
    >
      <span className="block font-sans text-[9px] md:text-[10px] tracking-[0.42em] uppercase text-crg-red mb-4 md:mb-5">
        {phase.tag}
      </span>
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight whitespace-pre-line mb-4">
        {phase.title}
      </h2>
      <p className="font-sans text-xs md:text-sm text-white/40 leading-relaxed hidden md:block">
        {phase.sub}
      </p>
    </motion.div>
  );
}

// ─── Phase dot indicator ──────────────────────────────────────────────────
function PhaseDot({
  index,
  range,
  scrollYProgress,
}: {
  index: number;
  range: [number, number];
  scrollYProgress: MotionValue<number>;
}) {
  const [start, end] = range;
  const mid = (start + end) / 2;
  const scale = useTransform(
    scrollYProgress,
    [start - 0.04, mid, end + 0.04],
    [1, 1.8, 1]
  );
  const bg = useTransform(
    scrollYProgress,
    [start - 0.04, start + 0.04, end - 0.04, end + 0.04],
    [
      "rgba(200,16,46,0.25)",
      "rgba(200,16,46,1)",
      "rgba(200,16,46,1)",
      "rgba(200,16,46,0.25)",
    ]
  );

  return (
    <motion.div
      style={{ scale, backgroundColor: bg }}
      className="w-1.5 h-1.5 rounded-full"
      aria-label={`Phase ${index + 1}`}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ConstructionParallax({ content }: { content: ConstructionParallaxContent }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phases: Phase[] = PHASE_RANGES.map((r, i) => ({ ...r, ...content.phases[i] }));

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── Building reveal: the facade rect grows upward from GROUND to B.y ──
  // As scroll goes 0.32→0.88, the top edge moves from GROUND (nothing) to B.y (full)
  const buildingTopY  = useTransform(scrollYProgress, [0.32, 0.88], [GROUND, B.y]);
  const buildingH     = useTransform(scrollYProgress, [0.32, 0.88], [0, B.h]);

  // ── Layer opacities ───────────────────────────────────────────────────
  const gridOpacity       = useTransform(scrollYProgress, [0.08, 0.18, 0.27, 0.36], [0, 1, 1, 0]);
  const foundationOpacity = useTransform(scrollYProgress, [0.22, 0.36], [0, 1]);
  const frameOpacity      = useTransform(scrollYProgress, [0.34, 0.52], [0, 1]);
  const windowOpacity     = useTransform(scrollYProgress, [0.60, 0.80], [0, 1]);
  const windowLitOpacity  = useTransform(scrollYProgress, [0.87, 1.00], [0, 1]);
  const rooftopOpacity    = useTransform(scrollYProgress, [0.77, 0.92], [0, 1]);
  const landscapeOpacity  = useTransform(scrollYProgress, [0.84, 0.97], [0, 1]);
  const craneOpacity      = useTransform(scrollYProgress, [0.34, 0.50, 0.72, 0.82], [0, 1, 1, 0]);

  // ── Progress bar ─────────────────────────────────────────────────────
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // ── Ambient sky lightening (very subtle) ─────────────────────────────
  const skyTopOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.06, 0]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${phases.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: "#0C0C10" }}>

        {/* ── SVG Scene ──────────────────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${SCENE.W} ${SCENE.H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            {/* Sky gradient */}
            <linearGradient id="cp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0A0A0F" />
              <stop offset="60%"  stopColor="#111118" />
              <stop offset="100%" stopColor="#16161E" />
            </linearGradient>

            {/* Ground gradient */}
            <linearGradient id="cp-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#131316" />
              <stop offset="100%" stopColor="#0A0A0C" />
            </linearGradient>

            {/* Window glow gradient (lit) */}
            <radialGradient id="win-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFF5DC" stopOpacity="1" />
              <stop offset="100%" stopColor="#F5C86A" stopOpacity="0.85" />
            </radialGradient>

            {/* Red accent gradient for horizon */}
            <linearGradient id="horizon-glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#C8102E" stopOpacity="0" />
              <stop offset="30%"  stopColor="#C8102E" stopOpacity="0.18" />
              <stop offset="50%"  stopColor="#C8102E" stopOpacity="0.30" />
              <stop offset="70%"  stopColor="#C8102E" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C8102E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ── Background sky ──────────────────────────────────── */}
          <rect x="0" y="0" width={SCENE.W} height={SCENE.H} fill="url(#cp-sky)" />

          {/* Subtle ambient lightening (mid phases) */}
          <motion.rect
            x="0" y="0" width={SCENE.W} height={GROUND}
            fill="#1A2030"
            style={{ opacity: skyTopOpacity }}
          />

          {/* ── Dot grid (background texture) ──────────────────── */}
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 20 }, (_, col) => (
              <circle
                key={`d${row}-${col}`}
                cx={col * 65 + 32}
                cy={row * 55 + 20}
                r={0.7}
                fill="rgba(255,255,255,0.06)"
              />
            ))
          )}

          {/* ── Horizon glow line ───────────────────────────────── */}
          <rect
            x="0" y={GROUND - 1} width={SCENE.W} height="2"
            fill="url(#horizon-glow)"
          />

          {/* ── Ground plane ────────────────────────────────────── */}
          <rect x="0" y={GROUND} width={SCENE.W} height={SCENE.H - GROUND} fill="url(#cp-ground)" />

          {/* Ground texture lines */}
          <line x1="0" y1={GROUND + 18} x2={SCENE.W} y2={GROUND + 18} stroke="#1C1C20" strokeWidth="1" />
          <line x1="0" y1={GROUND + 40} x2={SCENE.W} y2={GROUND + 40} stroke="#181818" strokeWidth="1" />

          {/* ── Survey / planning grid ──────────────────────────── */}
          <motion.g style={{ opacity: gridOpacity }}>
            {/* Vertical grid lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <line
                key={`gv${i}`}
                x1={B.x + i * (B.w / 4)} y1={100}
                x2={B.x + i * (B.w / 4)} y2={GROUND}
                stroke="#C8102E" strokeWidth="0.6" strokeDasharray="6,10" strokeOpacity="0.5"
              />
            ))}
            {/* Horizontal grid lines */}
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <line
                key={`gh${i}`}
                x1={B.x - 60} y1={GROUND - i * 68}
                x2={B.x + B.w + 60} y2={GROUND - i * 68}
                stroke="#C8102E" strokeWidth="0.6" strokeDasharray="6,10" strokeOpacity="0.5"
              />
            ))}
            {/* Corner survey marks */}
            {[
              [B.x, B.y], [B.x + B.w, B.y], [B.x, GROUND], [B.x + B.w, GROUND]
            ].map(([cx, cy], i) => (
              <g key={`mark${i}`}>
                <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke="#C8102E" strokeWidth="1.5" />
                <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke="#C8102E" strokeWidth="1.5" />
              </g>
            ))}
            {/* Technical annotations */}
            <text x={B.x + B.w + 14} y={B.y + B.h / 2} fill="#C8102E" fontSize="10"
                  fontFamily="monospace" fillOpacity="0.7">H = 42m</text>
            <text x={B.x + B.w / 2 - 18} y={B.y - 14} fill="#C8102E" fontSize="10"
                  fontFamily="monospace" fillOpacity="0.7">L = 32m</text>
            {/* Dimension arrows */}
            <line x1={B.x + B.w + 8} y1={B.y} x2={B.x + B.w + 8} y2={GROUND}
                  stroke="#C8102E" strokeWidth="0.7" strokeOpacity="0.4" />
          </motion.g>

          {/* ── Foundation ──────────────────────────────────────── */}
          <motion.g style={{ opacity: foundationOpacity }}>
            {/* Foundation slab */}
            <rect x={B.x - 25} y={GROUND - 22} width={B.w + 50} height={28}
                  fill="#181820" stroke="#2A2A32" strokeWidth="1" />
            {/* Foundation pads (one per column) */}
            {COLS.slice(0, -1).map((cx, i) => (
              <rect key={i} x={cx + 8} y={GROUND - 42} width={BAY_W - 16} height={22}
                    fill="#141418" stroke="#252530" strokeWidth="0.8" />
            ))}
            {/* Hatch lines on foundation */}
            {Array.from({ length: 14 }, (_, i) => (
              <line key={i}
                x1={B.x - 25 + i * 26} y1={GROUND - 22}
                x2={B.x - 25 + i * 26 - 14} y2={GROUND + 6}
                stroke="#C8102E" strokeWidth="0.5" strokeOpacity="0.22"
              />
            ))}
          </motion.g>

          {/* ── Construction crane ──────────────────────────────── */}
          <motion.g style={{ opacity: craneOpacity }}>
            {/* Mast */}
            <rect x={B.x + B.w + 55} y={B.y - 60} width="8" height={GROUND - B.y + 60}
                  fill="#1E1E28" stroke="#2E2E3A" strokeWidth="1" />
            {/* Horizontal jib */}
            <rect x={B.x + B.w - 20} y={B.y - 58} width={180} height="6"
                  fill="#1E1E28" stroke="#2E2E3A" strokeWidth="1" />
            {/* Counter jib */}
            <rect x={B.x + B.w - 20} y={B.y - 58} width={-60} height="6"
                  fill="#1E1E28" stroke="#2E2E3A" strokeWidth="1" />
            {/* Cable */}
            <line x1={B.x + B.w + 155} y1={B.y - 52}
                  x2={B.x + B.w + 130} y2={B.y + 40}
                  stroke="#2A2A38" strokeWidth="1" />
            {/* Hook */}
            <rect x={B.x + B.w + 123} y={B.y + 38} width="14" height="10"
                  fill="#1E1E28" stroke="#2E2E3A" strokeWidth="0.8" />
            {/* Mast guy wires */}
            <line x1={B.x + B.w + 59} y1={B.y - 52} x2={B.x + B.w + 100} y2={GROUND - 20}
                  stroke="#252530" strokeWidth="0.7" />
          </motion.g>

          {/* ── Structural frame (columns + beams) ──────────────── */}
          <motion.g style={{ opacity: frameOpacity }}>
            {COLS.map((cx, i) => (
              <rect key={`col${i}`} x={cx - 3} y={B.y} width="6" height={B.h}
                    fill="#1E1E28" />
            ))}
            {BEAMS.map((by, i) => (
              <rect key={`beam${i}`} x={B.x} y={by - 2} width={B.w} height="4"
                    fill="#1E1E28" />
            ))}
          </motion.g>

          {/* ── Building facade (grows upward) ───────────────────── */}
          {/* Main facade rect with animated height */}
          <motion.rect
            x={B.x} width={B.w}
            y={buildingTopY}
            height={buildingH}
            fill="#18181E"
          />

          {/* Facade panel joints (horizontal — floor separators) */}
          {BEAMS.map((by, i) => (
            <motion.rect
              key={`fj${i}`}
              x={B.x} y={by} width={B.w} height="1"
              fill="#222228"
              style={{ opacity: useTransform(scrollYProgress, [0.40, 0.58], [0, 1]) }}
            />
          ))}

          {/* Facade panel joints (vertical — bay separators) */}
          {COLS.map((cx, i) => (
            <motion.rect
              key={`bj${i}`}
              x={cx} y={B.y} width="1" height={B.h}
              fill="#222228"
              style={{ opacity: useTransform(scrollYProgress, [0.40, 0.58], [0, 1]) }}
            />
          ))}

          {/* ── Windows (dark glass) ────────────────────────────── */}
          <motion.g style={{ opacity: windowOpacity }}>
            {WINDOWS.map((w, i) => (
              <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h}
                    fill="#1E2535" stroke="#28304A" strokeWidth="0.5" />
            ))}
          </motion.g>

          {/* ── Window lights (inhabited — final phase) ─────────── */}
          <motion.g style={{ opacity: windowLitOpacity }}>
            {WINDOWS.map((w, i) => (
              // Not all windows are lit — alternate pattern
              i % 3 !== 2 && (
                <rect key={i} x={w.x + 1} y={w.y + 1} width={w.w - 2} height={w.h - 2}
                      fill="url(#win-glow)" />
              )
            ))}
            {/* Entrance glow at ground floor */}
            <rect x={B.x + B.w / 2 - 22} y={GROUND - 38} width="44" height="36"
                  fill="#FFF5DC" fillOpacity="0.25" />
          </motion.g>

          {/* ── Building outline ─────────────────────────────────── */}
          <motion.rect
            x={B.x} y={B.y} width={B.w} height={B.h}
            fill="none" stroke="#2E2E3A" strokeWidth="1.5"
            style={{ opacity: useTransform(scrollYProgress, [0.45, 0.62], [0, 1]) }}
          />

          {/* ── Rooftop ─────────────────────────────────────────── */}
          <motion.g style={{ opacity: rooftopOpacity }}>
            {/* Penthouse setback */}
            <rect x={B.x + 50} y={B.y - 38} width={B.w - 100} height={42}
                  fill="#1C1C22" stroke="#2E2E38" strokeWidth="1" />
            {/* Penthouse windows */}
            <rect x={B.x + 68} y={B.y - 30} width={52} height={24}
                  fill="#1E2535" stroke="#28304A" strokeWidth="0.5" />
            <rect x={B.x + B.w - 120} y={B.y - 30} width={52} height={24}
                  fill="#1E2535" stroke="#28304A" strokeWidth="0.5" />
            {/* Penthouse lights */}
            <motion.rect x={B.x + 69} y={B.y - 29} width={50} height={22}
                         fill="url(#win-glow)"
                         style={{ opacity: windowLitOpacity }} />
            <motion.rect x={B.x + B.w - 119} y={B.y - 29} width={50} height={22}
                         fill="url(#win-glow)"
                         style={{ opacity: windowLitOpacity }} />
            {/* Roof railing */}
            <line x1={B.x} y1={B.y} x2={B.x + B.w} y2={B.y}
                  stroke="#C8102E" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* Antenna */}
            <line x1={B.x + B.w / 2} y1={B.y - 38} x2={B.x + B.w / 2} y2={B.y - 72}
                  stroke="#333340" strokeWidth="1.5" />
            <circle cx={B.x + B.w / 2} cy={B.y - 74} r="3" fill="#C8102E" fillOpacity="0.8" />
          </motion.g>

          {/* ── Landscaping (final phase) ────────────────────────── */}
          <motion.g style={{ opacity: landscapeOpacity }}>
            {/* Left tree group */}
            {[B.x - 55, B.x - 85, B.x - 30].map((tx, i) => (
              <g key={i}>
                <rect x={tx + 6} y={GROUND - 22} width="4" height="22"
                      fill="#1A1A20" />
                <ellipse cx={tx + 8} cy={GROUND - 26} rx={12 - i * 2} ry={20 - i * 2}
                         fill="#18201A" stroke="#222A22" strokeWidth="0.8" />
              </g>
            ))}
            {/* Right tree group */}
            {[B.x + B.w + 30, B.x + B.w + 55, B.x + B.w + 80].map((tx, i) => (
              <g key={i}>
                <rect x={tx + 6} y={GROUND - 22} width="4" height="22"
                      fill="#1A1A20" />
                <ellipse cx={tx + 8} cy={GROUND - 26} rx={14 - i * 2} ry={22 - i * 2}
                         fill="#18201A" stroke="#222A22" strokeWidth="0.8" />
              </g>
            ))}
            {/* Entrance plaza */}
            <rect x={B.x + B.w / 2 - 40} y={GROUND} width="80" height="6"
                  fill="#1C1C22" />
            {/* Red entrance accent line */}
            <line x1={B.x} y1={GROUND} x2={B.x + B.w} y2={GROUND}
                  stroke="#C8102E" strokeWidth="1.5" strokeOpacity="0.5" />
          </motion.g>

          {/* ── Distant building silhouettes (depth) ─────────────── */}
          <rect x="80"  y={GROUND - 95}  width="55" height="95"  fill="#111115" />
          <rect x="100" y={GROUND - 130} width="20" height="130" fill="#0F0F13" />
          <rect x="160" y={GROUND - 75}  width="40" height="75"  fill="#111115" />
          <rect x="870" y={GROUND - 110} width="60" height="110" fill="#111115" />
          <rect x="950" y={GROUND - 80}  width="45" height="80"  fill="#111115" />
          <rect x="1030" y={GROUND - 140} width="30" height="140" fill="#0F0F13" />
          <rect x="1070" y={GROUND - 65}  width="50" height="65"  fill="#111115" />

          {/* ── Right-side vertical measurement line ─────────────── */}
          <motion.g style={{ opacity: useTransform(scrollYProgress, [0.35, 0.55, 0.85, 0.95], [0, 0.6, 0.6, 0]) }}>
            <line x1={B.x + B.w + 30} y1={B.y} x2={B.x + B.w + 30} y2={GROUND}
                  stroke="#C8102E" strokeWidth="0.8" strokeOpacity="0.35" />
            <line x1={B.x + B.w + 26} y1={B.y} x2={B.x + B.w + 34} y2={B.y}
                  stroke="#C8102E" strokeWidth="0.8" strokeOpacity="0.35" />
            <line x1={B.x + B.w + 26} y1={GROUND} x2={B.x + B.w + 34} y2={GROUND}
                  stroke="#C8102E" strokeWidth="0.8" strokeOpacity="0.35" />
          </motion.g>
        </svg>

        {/* ── Text overlays (HTML for crisp rendering) ───────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {phases.map((phase, i) => (
            <PhaseText key={i} phase={phase} scrollYProgress={scrollYProgress} />
          ))}
        </div>

        {/* ── Phase indicator dots (right side) ──────────────────────── */}
        <div className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          {phases.map((phase, i) => (
            <PhaseDot
              key={i}
              index={i}
              range={phase.range}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* ── Scroll hint (fades after first 5%) ─────────────────────── */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-sans text-[9px] tracking-[0.42em] uppercase text-white/25">
              Scorri
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </motion.div>

        {/* ── Progress bar ────────────────────────────────────────────── */}
        <motion.div
          style={{ scaleX: barScale }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-crg-red origin-left z-20"
        />
      </div>
    </div>
  );
}
