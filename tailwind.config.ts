import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        "crg-red": "#C8102E",
        "crg-red-dark": "#9B0D23",
        "crg-red-light": "#FDF2F4",
        // Neutrals
        charcoal: "#1A1A1A",
        anthracite: "#252525",
        "mid-gray": "#6B6B6B",
        "light-gray": "#F3F3F3",
        cream: "#FAFAFA",
        // Keep for back-compat
        "warm-gray": "#6B6B6B",
        "border-warm": "#E2E2E2",
        "gold-light": "#FDF2F4", // remapped to red-light for old refs
      },
      fontFamily: {
        heading: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.25, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
